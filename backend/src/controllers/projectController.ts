import { Request, Response } from 'express';

import { Role } from '@prisma/client';

import prisma from '../lib/prisma';
import { projectSchema } from '../schemas/projectSchema';


export const createProject = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const parsedSchema = projectSchema.safeParse(req.body);
  
  if (!parsedSchema.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsedSchema.error,
    });
    
    return;
  }
  
  try {
    const { name, description } = parsedSchema.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: Role.ADMIN, // Creator becomes admin
          },
        },
      },
    });

    res.status(201).json({ project });
  } catch (error) {
    console.log("Project creation error: ", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    const createdProjects = projects.filter(p => p.ownerId == userId);
    const memberProjects = projects.filter(p => p.ownerId !== userId);

    res.status(200).json({ createdProjects, memberProjects });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.projectId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify user is part of the project
    const isMember = project.members.some(m => m.userId === userId);
    if (!isMember) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const projectId = req.params.projectId as string;
    const { email, role } = req.body;

    // Check if the current user is an admin of the project
    const adminMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: adminId } },
    });

    if (!adminMember || adminMember.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Only admins can add members' });
      return;
    }

    // Find the user to add by email
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      res.status(404).json({ error: 'User with this email not found' });
      return;
    }

    // Add member
    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: role || Role.MEMBER,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(200).json({ member: newMember });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'User is already a member of this project' });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

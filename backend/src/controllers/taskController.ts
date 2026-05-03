import { Request, Response } from 'express';
import { Role, Status, Priority } from '@prisma/client';
import prisma from '../lib/prisma';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  projectId: z.string(),
  assigneeId: z.string().optional(),
});

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = (req as any).user.id;
    const { title, description, dueDate, priority, status, projectId, assigneeId } = taskSchema.parse(req.body);

    const projectMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: creatorId } },
    });

    if (!projectMember) {
      res.status(403).json({ error: 'You are not a member of this project' });
      return;
    }

    if (projectMember.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Only project admins can create tasks' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        priority: priority || Priority.MEDIUM,
        status: status || Status.TODO,
        projectId,
        creatorId,
        assigneeId,
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ error: 'projectId query parameter is required' });
      return;
    }

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!isMember) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  assigneeId: z.string().optional().nullable(),
});

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.taskId as string;
    const updateData = updateTaskSchema.parse(req.body);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const member = task.project.members.find(m => m.userId === userId);
    
    if (!member) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (member.role === Role.MEMBER) {
      if (task.assigneeId !== userId) {
        res.status(403).json({ error: 'Members can only update their assigned tasks' });
        return;
      }
      
      const allowedUpdates: any = {};
      if (updateData.status) allowedUpdates.status = updateData.status;
      
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: allowedUpdates,
      });
      res.status(200).json({ task: updatedTask });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    res.status(200).json({ task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

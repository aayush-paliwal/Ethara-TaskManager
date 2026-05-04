import { z } from 'zod';
import { Request, Response } from 'express';

import { Role, Status, Priority } from '@prisma/client';

import prisma from '../lib/prisma';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchema';


export const createTask = async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const parsedSchema = createTaskSchema.safeParse(req.body);
  
  if(!parsedSchema.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsedSchema.error,
    });
    
    return;
  }
  
  try {
    const { title, description, dueDate, priority, status, projectId, assigneeId } = parsedSchema.data;

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
    console.log("Task creation error: ", error);    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
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



export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  const taskId = req.params.taskId as string;
  const parsedSchema = updateTaskSchema.safeParse(req.body);
  
  if (!parsedSchema.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsedSchema.error,
    });
    
    return;
  }
  
  try {
    const updateData = parsedSchema.data;

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
    console.log("Task updation error: ", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

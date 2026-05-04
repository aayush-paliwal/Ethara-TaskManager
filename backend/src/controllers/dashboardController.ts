import { Request, Response } from 'express';

import prisma from '../lib/prisma';


export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    
    const projectIds = userProjects.map(p => p.projectId);

    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } }
    });

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: { id: true },
    });

    const myTasksCount = await prisma.task.count({
      where: { assigneeId: userId }
    });

    const overdueTasksCount = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: 'DONE' },
        dueDate: { lt: new Date() }
      }
    });

    res.status(200).json({
      metrics: {
        totalTasks,
        myTasksCount,
        overdueTasksCount,
        tasksByStatus: tasksByStatus.map(s => ({ status: s.status, count: s._count.id }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

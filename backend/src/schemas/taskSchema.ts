import z from "zod";
import { Priority, Status } from "@prisma/client";


export const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    priority: z.enum(Priority).optional(),
    status: z.enum(Status).optional(),
    projectId: z.string(),
    assigneeId: z.string().optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    priority: z.enum(Priority).optional(),
    status: z.enum(Status).optional(),
    assigneeId: z.string().optional().nullable(),
});
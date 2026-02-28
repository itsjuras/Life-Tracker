import { Request, Response, NextFunction } from 'express';
import * as TaskModel from '../models/task.model';

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string;
    const tasks = await TaskModel.getTasksByDate(req.userId, date);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, title, sortOrder } = req.body as { date: string; title: string; sortOrder: number };
    const task = await TaskModel.createTask(req.userId, date, title, sortOrder);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const task = await TaskModel.updateTask(id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await TaskModel.deleteTask(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

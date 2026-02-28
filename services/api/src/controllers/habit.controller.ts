import { Request, Response, NextFunction } from 'express';
import * as HabitModel from '../models/habit.model';

export async function listHabits(req: Request, res: Response, next: NextFunction) {
  try {
    const habits = await HabitModel.getHabitsByUser(req.userId);
    res.json(habits);
  } catch (err) {
    next(err);
  }
}

export async function createHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, iconKey } = req.body as { name: string; iconKey: string };
    const habit = await HabitModel.createHabit(req.userId, name, iconKey);
    res.status(201).json(habit);
  } catch (err) {
    next(err);
  }
}

export async function updateHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const habit = await HabitModel.updateHabit(id, req.body);
    res.json(habit);
  } catch (err) {
    next(err);
  }
}

export async function setHabitEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { date, completed } = req.body as { date: string; completed: boolean };
    const entry = await HabitModel.upsertHabitEntry(id, date, completed);
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getEntriesForDate(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string;
    const entries = await HabitModel.getHabitEntriesByDate(req.userId, date);
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

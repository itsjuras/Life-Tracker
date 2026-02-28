import { Request, Response, NextFunction } from 'express';
import * as ReflectionModel from '../models/reflection.model';

export async function getReflection(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string;
    const entry = await ReflectionModel.getReflection(req.userId, date);
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

export async function upsertReflection(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, text } = req.body as { date: string; text: string };
    const entry = await ReflectionModel.upsertReflection(req.userId, date, text);
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

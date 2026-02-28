import { Request, Response, NextFunction } from 'express';
import * as StatModel from '../models/stat.model';

export async function listStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await StatModel.getStatDefinitionsByUser(req.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function createStat(req: Request, res: Response, next: NextFunction) {
  try {
    const { key, label, unit } = req.body as { key: string; label: string; unit: string };
    const stat = await StatModel.createStatDefinition(req.userId, key, label, unit);
    res.status(201).json(stat);
  } catch (err) {
    next(err);
  }
}

export async function logStatEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { date, value } = req.body as { date: string; value: number };
    const entry = await StatModel.upsertStatEntry(id, date, value);
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getStatEntries(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { from, to } = req.query as { from: string; to: string };
    const entries = await StatModel.getStatEntries(id, from, to);
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

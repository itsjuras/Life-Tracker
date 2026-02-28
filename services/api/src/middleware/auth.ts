import { Request, Response, NextFunction } from 'express';

// Augment Express Request to carry the authenticated user id.
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

// TODO: verify JWT from Authorization header and set req.userId.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  // Placeholder — replace with real JWT verification.
  req.userId = 'TODO';
  next();
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import habitRoutes from './views/habit.routes';
import taskRoutes from './views/task.routes';
import statRoutes from './views/stat.routes';
import reflectionRoutes from './views/reflection.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/v1/habits', habitRoutes);
app.use('/v1/tasks', taskRoutes);
app.use('/v1/stats', statRoutes);
app.use('/v1/reflection', reflectionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

export default app;

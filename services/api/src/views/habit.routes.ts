import { Router } from 'express';
import * as controller from '../controllers/habit.controller';

const router = Router();

router.get('/', controller.listHabits);
router.post('/', controller.createHabit);
router.patch('/:id', controller.updateHabit);
router.post('/:id/entries', controller.setHabitEntry);
router.get('/entries', controller.getEntriesForDate);

export default router;

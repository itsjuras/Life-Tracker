import { Router } from 'express';
import * as controller from '../controllers/task.controller';

const router = Router();

router.get('/', controller.listTasks);
router.post('/', controller.createTask);
router.patch('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

export default router;

import { Router } from 'express';
import * as controller from '../controllers/stat.controller';

const router = Router();

router.get('/', controller.listStats);
router.post('/', controller.createStat);
router.post('/:id/entries', controller.logStatEntry);
router.get('/:id/entries', controller.getStatEntries);

export default router;

import { Router } from 'express';
import * as controller from '../controllers/reflection.controller';

const router = Router();

router.get('/', controller.getReflection);
router.put('/', controller.upsertReflection);

export default router;

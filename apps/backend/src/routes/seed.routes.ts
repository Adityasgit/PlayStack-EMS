import { Router } from 'express';
import { seed } from '../controllers/seed.controller';

const router = Router();

router.post('/', seed);

export default router;

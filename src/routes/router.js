import express from 'express';
import { createEventView, listEventsView } from '../controllers/eventController.js';

const router = express.Router();

router.get('/create', createEventView);
router.get('/list', listEventsView);

export default router;
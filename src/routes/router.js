import express from 'express';
import { createEvent, createEventView, listEventsView } from '../controllers/eventController.js';

const router = express.Router();

router.get('/create', createEventView);
router.get('/list', listEventsView);
router.post('/create', createEvent);

export default router;
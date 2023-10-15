import express from 'express';
import { createEvent, createEventView, listEventsView, getEventFeed} from '../controllers/eventController.js';

const router = express.Router();

router.get('/create', createEventView);
router.get('/list', listEventsView);
router.post('/create', createEvent);
router.get('/feed', getEventFeed)

export default router;
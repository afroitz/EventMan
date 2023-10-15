import express from 'express';
import EventController from '../controllers/eventController.js';

const router = express.Router();
const eventController = new EventController();

router.get('/create', eventController.createEventView);
router.get('/list', eventController.listEventsView);
router.post('/create', eventController.createEvent);
router.get('/feed', eventController.getEventFeed)

export default router;
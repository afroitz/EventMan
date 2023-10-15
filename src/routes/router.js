import express from 'express';
import EventController from '../controllers/EventController.js';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();
const eventController = new EventController();
const authController = new AuthController();

router.get('/create', eventController.createEventView);
router.get('/list', eventController.listEventsView);
router.post('/create', eventController.createEvent);
router.get('/feed', eventController.getEventFeed)

router.get('/login', authController.loginView);
router.post('/login', authController.login);

export default router;
import express from 'express';
import EventController from '../controllers/EventController.js';
import AuthController from '../controllers/AuthController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const eventController = new EventController();
const authController = new AuthController();

router.get('/', (req, res) => {
  res.redirect('/list');
});

router.get('/create', auth, eventController.createEventView);
router.get('/list', auth, eventController.listEventsView);
router.post('/create', auth, eventController.createEvent);
router.get('/feed', auth, eventController.getEventFeed)

router.get('/login', authController.loginView);
router.post('/login', authController.login);

export default router;
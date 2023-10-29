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

router.get('/create', eventController.createEventView);
router.get('/list', eventController.listEventsView);
router.post('/create', eventController.createEvent);
router.get('/feed', eventController.getEventFeed)
router.get('/get-events-from-gioele', eventController.getEventsFromGioeleView);
router.post('/get-events-from-gioele', eventController.getEventsFromGioele);
router.get('/import-events', eventController.importEventsView);
router.post('/import-events', eventController.importEvents);

router.get('/login', authController.loginView);
router.post('/login', authController.login);

export default router;
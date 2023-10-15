import { Feed } from "feed";
import EventRepository from "../repositories/EventRepository.js";


class EventController {
  repository;

  constructor() {
    this.repository = new EventRepository();
  }

  /**
   * Render view for listing events
   */
  listEventsView = async (req, res) => {

    const events = await this.repository.list();

    res.render("listEvents", {
      events: events,
      routes: {
        create: process.env.APP_URL + "/create",
        list: process.env.APP_URL + "/list",
        feed: process.env.APP_URL + "/feed",
      },
    });
  };

  /**
   * Render the view for creating a new event
   */
  createEventView = (req, res) => {

    res.render("createEvent", {
      routes: {
        create: process.env.APP_URL + "/create",
        list: process.env.APP_URL + "/list",
        feed: process.env.APP_URL + "/feed",
      },
    });
  };

  /**
   * Handle post request for creating new event
   */
  createEvent = async (req, res) => {

    try {
      // get event name, description, and date from request body
      const {
        event_name: eventName,
        event_description: eventDescription,
        event_date: eventDate,
      } = req.body;

      // save event to db
      this.repository.create({
        name: eventName,
        description: eventDescription,
        date: eventDate,
      });
    } catch (e) {
      res.status(500).send("error creating event");
    }
  };

  /**
   * Create an Atom feed for events
   */
  getEventFeed = async (req, res) => {

    try {
      // create feed
      const feed = new Feed({
        title: "Event Feed",
        description:
          "This is an amazing feed informing you about upcoming events.",
        id: process.env.APP_URL + "/feed",
        link: process.env.APP_URL + "/feed",
        language: "en",
      });

      // get events from db
      const events = await this.repository.list()
      
      // add events to feed
      events.forEach((event) => {
        feed.addItem({
          title: event.name,
          id: `http://example.com/events/${event.id}`,
          link: `http://example.com/events/${event.id}`,
          description: event.description,
          date: event.date,
        });
      });

      res.set("Content-Type", "application/atom+xml");
      res.send(feed.atom1());
    } catch (e) {
      console.log(e);
      res.status(400).send("error requesting feed");
    }
  };
}

export default EventController;

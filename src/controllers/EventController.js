import { Feed } from "feed";
import EventRepository from "../repositories/EventRepository.js";
import xml2js from "xml2js";
import fetch from "node-fetch";
import { promisify } from "util";

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
        create: "/create",
        list: "/list",
        feed: "/feed",
        getFromGioele: "/get-events-from-gioele",
      },
    });
  };

  /**
   * Render the view for creating a new event
   */
  createEventView = (req, res) => {
    res.render("createEvent", {
      routes: {
        create: "/create",
        list: "/list",
        feed: "/feed",
        getFromGioele: "/get-events-from-gioele",
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
        event_title: eventTitle,
        event_summary: eventSummary,
        event_date: eventDate,
      } = req.body;

      // save event to db
      await this.repository.create({
        title: eventTitle,
        summary: eventSummary,
        date: eventDate,
        author: { name: req.session.user },
      });

      res.redirect("/list");
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
      const events = await this.repository.list();

      events.forEach((event) => {
        feed.addItem({
          title: event.title,
          id: "urn:uuid:" + event.id,
          link: `${process.env.APP_URL}/events/${event.id}`,
          author: [{ name: event.author.name ?? "Unknown author" }],
          date: event.updated,
          summary: "test",
          published: event.published,
        });
      });

      res.set("Content-Type", "application/atom+xml");
      res.send(feed.atom1());
    } catch (e) {
      console.log(e);
      res.status(400).send("error requesting feed");
    }
  };

  /**
   * Render view for getting events from Gioele
   */
  getEventsFromGioeleView = (req, res) => {
    res.render("getEventsFromGioele", {
      routes: {
        create: "/create",
        list: "/list",
        feed: "/feed",
        getFromGioele: "/get-events-from-gioele",
      },
    });
  };

  /**
   * Get events from Gioele
   */
  getEventsFromGioele = async (req, res) => {
    try {
      // fetch atom file
      const response = await fetch(process.env.ATOM_URL);
      const xml = await response.text();

      // parse atom file
      const parseString = promisify(
        xml2js.Parser({ explicitArray: false }).parseString
      );
      const result = await parseString(xml);

      const events = Array.isArray(result.feed.entry)
        ? result.feed.entry
        : [result.feed.entry];

      let updatedEvents = 0;
      let newEvents = 0;

      // try to get event by id
      for (const event of events) {
        try {
          if (event.id.slice(0, 9) === "urn:uuid:") {
            event.id = event.id.slice(9);
          }

          const previousEvent = await this.repository.get(event.id);

          if (!previousEvent) {
            // does not exist, so create in db
            await this.repository.create(event);
            newEvents++;
          } else if (event.updated > previousEvent.updated) {
            // is newer version, so update in db
            await this.repository.update(event);
            updatedEvents++;
          }
        } catch (e) {
          console.log(e);
        }
      }

      res.json({
        events: events.length,
        new: newEvents,
        updated: updatedEvents,
      });
    } catch (e) {
      console.log(e);
      res.status(500).send("Error");
    }
  };
}

export default EventController;

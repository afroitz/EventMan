import { Feed } from "feed";
import EventRepository from "../repositories/EventRepository.js";
import xml2js from "xml2js";
import fetch from "node-fetch";
import { promisify } from "util";
import EventService from "../services/EventService.js";
import { report } from "process";

class EventController {
  repository;

  constructor() {
    this.repository = new EventRepository();
    this.service = new EventService();

    this.routes = {
      create: "/create",
      list: "/list",
      feed: "/feed",
      import: "/import-events"
    }

    this.importUrls = [
      {
        url: 'https://gioele.uber.space/k/fdla2023/feed1.atom',
        name: 'Gioele Barabucci'
      },
      {
        url: 'https://fdla-atom-feed.xyz/feed',
        name: 'Nadjim Noori & Kai Niebes'
      },
      {
        url: 'https://flaskwebproject-47bce51faaa6.herokuapp.com/',
        name: 'Julia Haschke, Pascale Boisvert, Lukas Wilkens '
      },
      {
        url: 'https://fdla-backend-project.onrender.com/',
        name: 'Andy Klenzman & Evgeniia'
      }
    ]
  }

  /**
   * Render view for listing events
   */
  listEventsView = async (req, res) => {
    const events = await this.repository.list();

    res.render("listEvents", {
      events: events,
      routes: this.routes
    });
  };

  /**
   * Render the view for creating a new event
   */
  createEventView = (req, res) => {
    res.render("createEvent", {
      routes: this.routes
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

      // save event to db and set origin to APP_URL
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
          description: event.summary,
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
  importEventsView = (req, res) => {

    res.render("importEventsFromUrl", {
      atomUrls: this.importUrls,
      routes: this.routes
    });
  };

  /**
   * Import an event from one of the available urls
   */
  importEvents = async (req, res) => {

    if (!req.body.url) {
      res.status(400).send("No url provided");
      return;
    }

    if(!this.importUrls.find(url => url.url === req.body.url)) {
      res.status(400).send("Url not supported");
      return;
    }

    try {
      const importResult = await this.service.importEventsFromUrl(req.body.url)

      res.json(importResult)
    } catch (e) {
      console.log(e);
      res.status(500).send("Error");
    }
  };

  importEventsFromAll = async (req, res) => {
  
    try {

      let urlsChecked = 0;
      let totalEvents = 0;
      let totalImported = 0;
      let totalUpdated = 0;

      for (const urlInfo of this.importUrls) {
        let importResult;
  
        try {
          importResult = await this.service.importEventsFromUrl(urlInfo.url);
        } catch (error) {
          // Handle the error, log it, or skip to the next iteration
          console.error(`Error importing events from ${urlInfo.name}:`, error);
          continue;
        }
  
        // Check if importResult is an object with the expected properties

        if (
          importResult &&
          importResult.events &&
          importResult.new !== undefined &&
          importResult.updated !== undefined
        ) {
          console.log(`Import result for ${urlInfo.name}:`, importResult);
          urlsChecked += 1;
          totalEvents += importResult.events;
          totalImported += importResult.new;
          totalUpdated += importResult.updated;
        } else {
          console.error(`Invalid import result from ${urlInfo.name}`);
          continue;
        }
      }
  
      let log = {
        urls: urlsChecked,
        events: totalEvents,
        new: totalImported,
        updated: totalUpdated,
      };

      res.json(log);

    } catch (e) {
      console.error("Error importing events:", e);
    }
  };
}

export default EventController;
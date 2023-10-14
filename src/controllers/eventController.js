import pool from "../../index.js"
import { Feed } from 'feed';

export const listEventsView = (req, res) => {
  res.render("listEvents", {
  } );
}

export const createEventView = (req, res) => {
  res.render("createEvent", {
    createEventRoute: process.env.APP_URL + "/create"
  } );
}

export const createEvent = async (req, res) => {

  // log request body
  console.log("Request Body:", req.body);

  // get event name, description, and date from request body
  const { event_name: eventName, event_description: eventDescription, event_date: eventDate } = req.body;
  
  //connect to db
  const client = await pool.connect()

  // insert event into db and return event or error
  try {

    await client.query('INSERT INTO events (name, date, description) VALUES ($1, $2, $3) RETURNING *', [eventName, eventDate, eventDescription])
    res.status(200).send("Successfully added event")

  } catch {
    console.log("error adding event")
    res.status(500).send("error adding event")

  // release db connection
  } finally {
    client.release()
  }
}

export const getEventFeed = async (req, res) => {
  const feed = new Feed({
    title: 'Event Feed',
    description: 'This is an amazing feed informing you about upcoming events.',
    id: process.env.APP_URL + '/feed',
    link: process.env.APP_URL + '/feed',
    language: 'en',
  });

  const client = await pool.connect()
  
  try {
    const result = await client.query('SELECT * FROM events')
    const events = result.rows;

    events.forEach((event) => {
      feed.addItem({
        title: event.name,
        id: `http://example.com/events/${event.id}`,
        link: `http://example.com/events/${event.id}`,
        description: event.description,
        date: event.date,
      });
    });

    res.set('Content-Type', 'application/atom+xml');
    res.send(feed.atom1());

  } catch(e) {
    console.log(e)
    res.status(500).send("error requesting feed")
  } finally {
    client.release()
  }
}
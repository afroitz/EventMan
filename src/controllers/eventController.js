import pool from "../../index.js"

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
  const { event_name: eventName, event_description: eventDescription, event_date: eventDate } = req.body;

  const client = await pool.connect()
  try {

    await client.query('INSERT INTO events (name, date, description) VALUES ($1, $2, $3) RETURNING *', [eventName, eventDate, eventDescription])
    res.status(200).send("Successfully added event")

  } catch {
    console.log("error adding event")
    res.status(500).send("error adding event")
  }
 
  client.release()
}
  

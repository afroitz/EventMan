import pool from "../../index.js"
import { v4 as uuidv4 } from "uuid";

class EventRepository {

  /**
   * Get an event by id
   */
  async get(id) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT * FROM events WHERE id = $1", [id]);
      return rows[0];
    } catch {
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Update and event
   */
  async update(event) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE events SET updated = $1, title = $2, date = $3,  summary = $4, author = $4 WHERE id = $6", [new Date(), event.title, event.date, event.summary, event.author, event.id]);
    } catch {
      throw new Error("error updating event");
    } finally {
      client.release();
    }
  }

  /**
   * Get an array of all events
   * @returns {Promise<Array>} list of events
   */
  async list() {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT * FROM events");
      return rows;
    } catch {
      throw new Error("error listing events");
    } finally {
      client.release();
    }
  }

  /**
   * Create a new event
   * @param event - event object with properties name, date and summary
   */
  async create(event) {
    const client = await pool.connect();

    if (!event.id) {
      event.id = uuidv4();
    }

    if(!event.published){
      event.published = new Date();
    }

    if(!event.updated){
      event.updated = new Date();
    }

    try {
      await client.query(
        "INSERT INTO events (id, published, updated, title, date, summary, author) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [event.id, event.published, event.updated, event.title, event.date, event.summary, event.author]
      );
    } catch(e) {
      console.log(e);
      throw new Error("error creating event");
    } finally {
      client.release();
    }
  }
}

export default EventRepository;

import pool from "../../index.js"

class EventRepository {

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
   * @param event - event object with properties name, date and description
   */
  async create(event) {
    const client = await pool.connect();

    try {
      await client.query(
        "INSERT INTO events (name, date, description) VALUES ($1, $2, $3) RETURNING *",
        [event.name, event.date, event.description]
      );
    } catch {
      throw new Error("error creating event");
    } finally {
      client.release();
    }
  }
}

export default EventRepository;

import EventRepository from "../repositories/EventRepository.js";
import OpenAI from 'openai';
import xml2js from "xml2js";
import fetch from "node-fetch";
import { promisify } from "util";

class EventService {
  constructor(){
    this.repository = new EventRepository();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? 'NO KEY'
    });
  }

  async importEventsFromUrl(url){
    try {
      // fetch atom file
      const response = await fetch(url);
      const xml = await response.text();

      // parse atom file
      const parseString = promisify(
        xml2js.Parser({ explicitArray: false }).parseString
      );
      const result = await parseString(xml);

      // check if there are multiple events
      const events = Array.isArray(result.feed.entry)
        ? result.feed.entry
        : [result.feed.entry];

      // count new and updated events
      let updatedEvents = 0;
      let newEvents = 0;

      // try to get event by id and origin
      for (const event of events) {
        try {

          //console.log('\n---\n');
          //console.log(JSON.stringify(event, null, 2));

          const previousEvent = await this.repository.get(event.id);

          let validatedEvent = {
            title: this.validateTextField(event.title, 'title'),
            id: event.id ?? null,
            published: event.published ?? null,
            updated: event.updated ?? null,
            date: event.date ?? null,
            summary: this.validateTextField(event.summary, 'summary'),
            author: { name: event.author?.name ?? 'NO AUTHOR' }
          }

          //console.log(JSON.stringify(validatedEvent, null, 2));

          if (!previousEvent) {
            // does not exist, so create in db
            await this.repository.create(validatedEvent, url);
            newEvents++;

            // update, if event is newer version and from the same source
          } else if (
            event.updated > previousEvent.updated &&
            previousEvent.origin == url
          ) {
            // is newer version, so update in db
            await this.repository.update(validatedEvent);
            updatedEvents++;
          }
        } catch (e) {
          console.log(e);
        }
      }

      return({
        events: events.length,
        new: newEvents,
        updated: updatedEvents,
      })

    } catch (e) {
      console.log(e);
    }

  }

  async getSampleEvent(){
    const prompt = 'Come up with a title and a short description of a made up, arbitrary but entertaining/fun event. Only respond with the title and description, nothing else. The title should be in between <title></title> tags and the description in between <description></description> tags.'

    const chatCompletion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    const response = chatCompletion.choices[0].message.content.split('\n').join(' ').replace('  ', ' ');

    const titleStartIndex = response.indexOf('<title>') + '<title>'.length;
    const titleEndIndex = response.indexOf('</title>');
    const title = response.substring(titleStartIndex, titleEndIndex);

    const descriptionStartIndex = response.indexOf('<description>') + '<description>'.length;
    const descriptionEndIndex = response.indexOf('</description>');
    const description = response.substring(descriptionStartIndex, descriptionEndIndex);

    console.log(title);
    console.log(description);

    await this.repository.create({
      title: title,
      summary: description,
      date: new Date(),
      author: { name: 'ChatGPT' },
    });
  }

  validateTextField = (value, fieldName) => {
    if(!value){
      return `NO ${fieldName.toUpperCase()}`;
    }

    if( typeof value === 'string' && value.length > 0) {
      return value;
    } 

    if( typeof value === 'object' && value._ && value._.length > 0) {
      return value._;
    }

    return `INVALID ${fieldName.toUpperCase()}`;
  }

  pingKnownUrls = async () => {
    for (const url of this.importUrls) {
      try {
        const response = await fetch(url.url);
        const xml = await response.text();
        console.log(`PING ${url.url} ${response.status} ${xml.length}`);
      } catch (e) {
        console.log(`PING ${url.url} ERROR`);
      }
    }
  }
}

export default EventService;
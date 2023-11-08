import EventRepository from "../repositories/EventRepository.js";
import OpenAI from 'openai';

class EventService {
  constructor(){
    this.repository = new EventRepository();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
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
}

export default EventService;
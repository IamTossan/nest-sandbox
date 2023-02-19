import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  saveEvent(name, payload) {
    const event = new Event();
    event.event_name = name;
    event.payload = payload;

    return this.eventRepository.save(event);
  }
}

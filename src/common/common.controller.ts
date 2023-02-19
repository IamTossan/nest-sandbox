import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  NatsContext,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { CommonService } from './common.service';

@Controller()
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @EventPattern('*', Transport.NATS)
  listener(@Ctx() context: NatsContext, @Payload() payload) {
    this.commonService.saveEvent(context.getArgs()[0], payload);
  }
}

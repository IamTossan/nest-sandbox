import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { UsersService } from './users.service';
import {
  CreateUserCommand,
  CreateUserDto,
  CreateUserFailedEvent,
  UserCreatedEvent,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GRAPHQL_PUBSUB } from '../common/common.module';
import { PubSub } from 'graphql-subscriptions';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    @Inject(GRAPHQL_PUBSUB) private readonly graphqlPubSub: PubSub,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    this.natsClient.emit(
      CreateUserCommand.event_name,
      new CreateUserCommand(createUserDto),
    );
  }

  @EventPattern(CreateUserCommand.event_name, Transport.NATS)
  async createHandler(@Payload() payload: CreateUserCommand) {
    try {
      const user = await this.usersService.create(payload);
      this.natsClient.emit(
        UserCreatedEvent.event_name,
        new UserCreatedEvent(user),
      );
    } catch (err) {
      const errorEvent = new CreateUserFailedEvent({
        ...payload,
        message: err.detail,
      });
      this.natsClient.emit(CreateUserFailedEvent.event_name, errorEvent);
    }
    return;
  }

  @EventPattern(UserCreatedEvent.event_name, Transport.NATS)
  onUserCreated(@Payload() payload: UserCreatedEvent) {
    this.graphqlPubSub.publish('userCreated', { userCreated: payload });
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: number) {
    return this.usersService.remove(id);
  }
}

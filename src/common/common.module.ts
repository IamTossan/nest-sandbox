import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Event } from './event.entity';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';

export const GRAPHQL_PUBSUB = 'GRAPHQL_PUBSUB';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [
    {
      provide: GRAPHQL_PUBSUB,
      useValue: new PubSub(),
    },
    CommonService,
  ],
  controllers: [CommonController],
  exports: [GRAPHQL_PUBSUB, CommonService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

import { Inject } from '@nestjs/common';
import { Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { GRAPHQL_PUBSUB } from '../common/common.module';

@Resolver()
export class UsersResolver {
  constructor(@Inject(GRAPHQL_PUBSUB) private readonly graphqlPubSub: PubSub) {}

  @Subscription('userCreated')
  userCreated() {
    return this.graphqlPubSub.asyncIterator('userCreated');
  }
}

import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import * as DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';

import { ProgramsService } from './programs.service';
import { CreateProgramInput } from './dto/create-program.input';
import { UpdateProgramInput } from './dto/update-program.input';
import { Program, ProgramNode } from './entities/program.entity';
import { ProgramNodesLoader } from './programs.dataloaders';
import { PublishProgramInput } from './dto/publish-program.input';

@Resolver('Program')
export class ProgramsResolver {
  private pubSub: PubSub;
  constructor(private readonly programsService: ProgramsService) {
    this.pubSub = new PubSub();
  }

  @Mutation('createProgram')
  async create(
    @Args('createProgramInput') createProgramInput: CreateProgramInput,
  ) {
    const program = await this.programsService.create(createProgramInput);
    await this.pubSub.publish('programAdded', { programAdded: program });
    return program;
  }

  @Query('programs')
  findAll() {
    return this.programsService.findAll();
  }

  @Query('program')
  findOne(@Args('id') id: string) {
    return this.programsService.findOne(id);
  }

  @Mutation('updateProgram')
  update(@Args('updateProgramInput') updateProgramInput: UpdateProgramInput) {
    return this.programsService.update(updateProgramInput);
  }

  @Mutation('publishProgram')
  publish(
    @Args('publishProgramInput') publishProgramInput: PublishProgramInput,
  ) {
    return this.programsService.publish(publishProgramInput);
  }

  @Mutation('removeProgram')
  remove(@Args('id') id: string) {
    return this.programsService.remove(id);
  }

  @ResolveField()
  async courses(
    @Parent() program: Program,
    @Loader(ProgramNodesLoader)
    programNodeLoader: DataLoader<ProgramNode['id'], ProgramNode>,
  ): Promise<ProgramNode[]> {
    const ids = program.root_node.children.slice(1);
    const nodes = (await programNodeLoader.loadMany(ids)) as ProgramNode[];
    return nodes.map((n) => ({ ...n, title: n.name }));
  }

  @Subscription('programAdded')
  programAdded() {
    return this.pubSub.asyncIterator('programAdded');
  }
}

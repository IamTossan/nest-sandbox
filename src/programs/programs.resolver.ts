import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ProgramsService } from './programs.service';
import { CreateProgramInput } from './dto/create-program.input';
import { UpdateProgramInput } from './dto/update-program.input';
import { Program } from './entities/program.entity';

@Resolver('Program')
export class ProgramsResolver {
  constructor(private readonly programsService: ProgramsService) {}

  @Mutation('createProgram')
  create(@Args('createProgramInput') createProgramInput: CreateProgramInput) {
    return this.programsService.create(createProgramInput);
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

  @Mutation('removeProgram')
  remove(@Args('id') id: string) {
    return this.programsService.remove(id);
  }

  @ResolveField()
  async courses(@Parent() program: Program) {
    const ids = program.root_node.children;
    const nodes = await this.programsService.findNodesByIds(ids);
    return nodes.map((n) => ({ ...n, title: n.name }));
  }
}

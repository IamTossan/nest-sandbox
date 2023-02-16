import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProgramsService } from './programs.service';
import { CreateProgramInput } from './dto/create-program.input';
import { UpdateProgramInput } from './dto/update-program.input';

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
  findOne(@Args('id') id: number) {
    return this.programsService.findOne(id);
  }

  @Mutation('updateProgram')
  update(@Args('updateProgramInput') updateProgramInput: UpdateProgramInput) {
    return this.programsService.update(updateProgramInput.id, updateProgramInput);
  }

  @Mutation('removeProgram')
  remove(@Args('id') id: number) {
    return this.programsService.remove(id);
  }
}

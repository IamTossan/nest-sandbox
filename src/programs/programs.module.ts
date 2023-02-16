import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsResolver } from './programs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program, ProgramNode } from './entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Program, ProgramNode])],
  providers: [ProgramsResolver, ProgramsService],
})
export class ProgramsModule {}

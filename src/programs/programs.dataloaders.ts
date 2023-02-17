import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';
import { ProgramNode } from './entities/program.entity';
import { ProgramsService } from './programs.service';

@Injectable()
export class ProgramNodesLoader implements NestDataLoader<string, ProgramNode> {
  constructor(private readonly programService: ProgramsService) {}

  generateDataLoader(): DataLoader<string, ProgramNode> {
    return new DataLoader<string, ProgramNode>((keys) =>
      this.programService.findNodesByIds(keys),
    );
  }
}

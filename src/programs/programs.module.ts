import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsResolver } from './programs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program, ProgramNode } from './entities/program.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader';
import { ProgramNodesLoader } from './programs.dataloaders';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Program, ProgramNode]), CommonModule],
  providers: [
    ProgramsResolver,
    ProgramsService,
    ProgramNodesLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class ProgramsModule {}

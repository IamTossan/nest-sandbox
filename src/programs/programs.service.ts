import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Program,
  ProgramNode,
  ProgramNodeType,
} from './entities/program.entity';
import * as GraphqlTypes from '../../src/graphql';

import { CreateProgramInput } from './dto/create-program.input';
import { UpdateProgramInput } from './dto/update-program.input';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(ProgramNode)
    private readonly programNodeRepository: Repository<ProgramNode>,
    private readonly datasource: DataSource,
  ) {}

  async create(
    createProgramInput: CreateProgramInput,
  ): Promise<GraphqlTypes.Program> {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const program = new Program();
    const rootNode = new ProgramNode();
    try {
      rootNode.type = ProgramNodeType.PROGRAM;
      rootNode.name = createProgramInput.name;
      await queryRunner.manager.save(rootNode);

      program.version_name = 'LATEST';
      program.root_node = rootNode;
      await queryRunner.manager.save(program);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return {
      id: program.id.toString(),
      title: rootNode.name,
      version: program.version_name,
      versionId: rootNode.id.toString(),
      courses: [],
    };
  }

  async findAll(): Promise<GraphqlTypes.Program[]> {
    const programs = await this.programRepository.find({
      relations: { root_node: true },
    });
    return programs.map((p) => ({
      id: p.id.toString(),
      title: p.root_node.name,
      version: p.version_name,
      versionId: p.root_node.id.toString(),
      courses: [],
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} program`;
  }

  update(id: number, updateProgramInput: UpdateProgramInput) {
    return `This action updates a #${id} program`;
  }

  remove(id: number) {
    return `This action removes a #${id} program`;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
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
      id: program.id,
      title: rootNode.name,
      version: program.version_name,
      versionId: rootNode.id,
      courses: [],
    };
  }

  async findAll(): Promise<GraphqlTypes.Program[]> {
    const programs = await this.programRepository.find({
      relations: { root_node: true },
    });
    return programs.map((p) => ({
      id: p.id,
      title: p.root_node.name,
      version: p.version_name,
      versionId: p.root_node.id,
      root_node: p.root_node,
    }));
  }

  async findOne(id: string) {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: { root_node: true },
    });
    return {
      id: program.id,
      title: program.root_node.name,
      version: program.version_name,
      versionId: program.root_node.id,
      root_node: program.root_node,
    };
  }

  async findNodesByIds(ids: string[]): Promise<ProgramNode[]> {
    return this.programNodeRepository.find({ where: { id: In(ids) } });
  }

  async getParentNode(
    queryRunner: QueryRunner,
    programId: string,
    currentNode: ProgramNode,
  ): Promise<ProgramNode | null> {
    switch (currentNode.type) {
      case ProgramNodeType.PROGRAM:
        return null;
      case ProgramNodeType.COURSE:
        const program = await queryRunner.manager.findOne(Program, {
          where: { id: programId },
          relations: { root_node: true },
        });
        return program.root_node;
    }
  }

  async updateNode(updateProgramInput: UpdateProgramInput) {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create a new node
      const targetNode = await queryRunner.manager.findOne(ProgramNode, {
        where: { id: updateProgramInput.targetId },
      });
      const updatedNode = new ProgramNode();
      updatedNode.type = targetNode.type;
      updatedNode.name = updateProgramInput.payload.title;
      updatedNode.content =
        updateProgramInput.payload.content || targetNode.content;
      updatedNode.children = targetNode.children;
      let currentNode = await queryRunner.manager.save(updatedNode);

      // update parents
      if (updatedNode.type !== ProgramNodeType.PROGRAM) {
      }

      // update program refs
      await queryRunner.manager.update(
        Program,
        {
          id: updateProgramInput.programId,
        },
        {
          root_node: updatedNode,
        },
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async addChild(updateProgramInput: UpdateProgramInput) {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create child node
      const childNode = new ProgramNode();
      childNode.type = updateProgramInput.payload.type;
      childNode.name = updateProgramInput.payload.title;
      childNode.content = updateProgramInput.payload.content;
      childNode.children = [];
      await queryRunner.manager.save(childNode);

      // clone target and add new child ref
      const targetNode = await queryRunner.manager.findOne(ProgramNode, {
        where: { id: updateProgramInput.targetId },
      });
      const updatedNode = new ProgramNode();
      updatedNode.type = targetNode.type;
      updatedNode.name = targetNode.name;
      updatedNode.content = targetNode.content;
      updatedNode.children = [...targetNode.children, childNode.id];
      let currentNode = await queryRunner.manager.save(updatedNode);

      // update parents

      if (currentNode.type !== ProgramNodeType.PROGRAM) {
      }

      // update program refs
      await queryRunner.manager.update(
        Program,
        {
          id: updateProgramInput.programId,
        },
        {
          root_node: currentNode,
        },
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async update(updateProgramInput: UpdateProgramInput) {
    switch (updateProgramInput.type) {
      case GraphqlTypes.UpdateProgramType.UpdateNode:
        await this.updateNode(updateProgramInput);
        break;
      case GraphqlTypes.UpdateProgramType.AddChild:
        await this.addChild(updateProgramInput);
        break;
    }
    return this.findOne(updateProgramInput.programId);
  }

  remove(id: string) {
    return `This action removes a #${id} program`;
  }
}

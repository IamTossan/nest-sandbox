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

const listNodesByProgramIdQuery = (id: string) => `
  with nodes as (
    with recursive base as (
        select
            id,
            name,
            type,
            content,
            children,
            jsonb_array_elements_text(children) as child_id
        from program_node
        where id = '${id}'
        union all
        select
            cur.id,
            cur.name,
            cur.type,
            cur.content,
            cur.children,
            jsonb_array_elements_text(cur.children) as child_id
        from program_node as cur
            inner join base as pre on cur.id::text = pre.child_id
    )
    select
        id,
        name,
        type,
        content,
        children
    from base
  )
  select distinct * from nodes
  ;
`;

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
  ): Promise<GraphqlTypes.Program & { root_node: ProgramNode }> {
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
      root_node: program.root_node,
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

  async findNodesByIds(ids: readonly string[]): Promise<ProgramNode[]> {
    return this.programNodeRepository.find({ where: { id: In(ids) } });
  }

  async findNodesByRootId(id: string): Promise<ProgramNode[]> {
    return this.programNodeRepository.query(listNodesByProgramIdQuery(id));
  }

  dfs(
    targetId: ProgramNode['id'],
    nextId: ProgramNode['id'],
    nodes: Map<ProgramNode['id'], ProgramNode>,
    currentPath: ProgramNode['id'][] = [],
  ): ProgramNode['id'][] | null {
    const newPath = [...currentPath, nextId];
    if (nextId === targetId) {
      return newPath;
    }
    for (let i of nodes.get(nextId).children.slice(1)) {
      const traversalResult = this.dfs(targetId, i, nodes, newPath);
      if (traversalResult !== null) {
        return traversalResult;
      }
    }
    return null;
  }

  async updateProgramNodes(updateProgramInput: UpdateProgramInput) {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // find path
      const program = await queryRunner.manager.findOne(Program, {
        where: { id: updateProgramInput.programId },
        relations: { root_node: true },
      });
      const nodes: ProgramNode[] = await queryRunner.manager.query(
        listNodesByProgramIdQuery(program.root_node.id),
      );
      const nodes_as_map = new Map();
      for (const n of nodes) {
        nodes_as_map.set(n.id, n);
      }
      const path = this.dfs(
        updateProgramInput.targetId,
        program.root_node.id,
        nodes_as_map,
      );

      // update target node
      let currentId = path.pop();
      let currentNode = nodes_as_map.get(currentId);
      let updatedNode = new ProgramNode();
      console.log(currentNode, nodes_as_map);
      updatedNode.name = currentNode.name;
      updatedNode.type = currentNode.type;
      updatedNode.content = currentNode.content;
      updatedNode.children = currentNode.children;

      switch (updateProgramInput.type) {
        case GraphqlTypes.UpdateProgramType.AddChild:
          const childNode = new ProgramNode();
          childNode.name = updateProgramInput.payload.title;
          childNode.type = updateProgramInput.payload.type;
          childNode.content = updateProgramInput.payload.content;
          await queryRunner.manager.save(childNode);
          updatedNode.children.push(childNode.id);
          break;
        case GraphqlTypes.UpdateProgramType.ReorderChildren:
        case GraphqlTypes.UpdateProgramType.RemoveChild:
          updatedNode.children = ['', ...updateProgramInput.payload.children];
          break;
        case GraphqlTypes.UpdateProgramType.UpdateNode:
          updatedNode.name =
            updateProgramInput.payload.title || updatedNode.name;
          updatedNode.content =
            updateProgramInput.payload.content || updatedNode.content;
          break;
      }
      await queryRunner.manager.save(updatedNode);

      // propagate update
      let nextId = path.pop();
      while (nextId) {
        currentNode = nodes_as_map.get(nextId);
        let nextNode = new ProgramNode();
        nextNode.name = currentNode.name;
        nextNode.type = currentNode.type;
        nextNode.content = currentNode.content;
        nextNode.children = [
          ...currentNode.children.slice(
            0,
            currentNode.children.indexOf(currentId),
          ),
          updatedNode.id,
          ...currentNode.children.slice(
            currentNode.children.indexOf(currentId) + 1,
          ),
        ];
        await queryRunner.manager.save(nextNode);

        currentId = currentNode.id;
        updatedNode = nextNode;
        nextId = path.pop();
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
      console.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async update(updateProgramInput: UpdateProgramInput) {
    await this.updateProgramNodes(updateProgramInput);
    return this.findOne(updateProgramInput.programId);
  }

  remove(id: string) {
    return `This action removes a #${id} program`;
  }
}

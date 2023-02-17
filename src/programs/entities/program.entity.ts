import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../../../src/common/base.entity';

export enum ProgramNodeType {
  PROGRAM = 'PROGRAM',
  COURSE = 'COURSE',
  UNIT = 'UNIT',
  HOMEWORK = 'HOMEWORK',
}

@Entity()
export class ProgramNode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProgramNodeType,
    default: ProgramNodeType.PROGRAM,
  })
  type: ProgramNodeType;

  @Column()
  name: string;

  @Column({
    type: 'jsonb',
    default: () => `'[""]'`,
    nullable: false,
  })
  children: Array<ProgramNode['id']>;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb", nullable: false })
  content: Record<string, any>;
}

@Entity()
export class Program extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  version_name: string;

  @OneToOne(() => ProgramNode, { nullable: false })
  @JoinColumn({ name: 'root_node_id' })
  root_node: ProgramNode;
}

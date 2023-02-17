import { Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsEnum,
  IsInstance,
  IsJSON,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  UpdateProgramInput as IUpdateProgramInput,
  UpdateProgramInputPayload as IUpdateProgramInputPayload,
  ProgramNodeType,
  UpdateProgramType,
} from '../../graphql';

export class UpdateProgramInputPayload implements IUpdateProgramInputPayload {
  @IsEnum(ProgramNodeType)
  @IsOptional()
  type: ProgramNodeType;

  @IsString()
  @IsOptional()
  title: string;

  @Allow()
  @IsOptional()
  content?: Record<string, any>[];

  @IsArray()
  @IsOptional()
  children?: string[];
}

export class UpdateProgramInput implements IUpdateProgramInput {
  @IsUUID()
  programId: string;

  @IsEnum(UpdateProgramType)
  type: UpdateProgramType;

  @IsUUID()
  targetId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateProgramInputPayload)
  payload: UpdateProgramInputPayload;
}

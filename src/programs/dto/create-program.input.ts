import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { CreateProgramInput as ICreateProgramInput } from '../../../src/graphql';

export class CreateProgramInput implements ICreateProgramInput {
  @IsString()
  @MinLength(3)
  name: string;
}

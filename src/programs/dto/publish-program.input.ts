import { IsString, IsUUID, MinLength } from 'class-validator';

import { PublishProgramInput as IPublishProgramInput } from '../../../src/graphql';

export class PublishProgramInput implements IPublishProgramInput {
  @IsUUID()
  programId: string;

  @IsString()
  @MinLength(3)
  label: string;
}

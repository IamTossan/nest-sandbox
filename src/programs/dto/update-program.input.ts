import { CreateProgramInput } from './create-program.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateProgramInput extends PartialType(CreateProgramInput) {
  id: number;
}

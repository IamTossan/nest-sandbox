import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateCoffeeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly brand: string;

  @IsString({ each: true })
  readonly flavors: string[];
}

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {}

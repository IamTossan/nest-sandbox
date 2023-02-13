import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('coffees')
export class CoffeeController {
  @Get(':id')
  getById(@Param('id') id: string) {
    return `coffee #${id} item`;
  }
}

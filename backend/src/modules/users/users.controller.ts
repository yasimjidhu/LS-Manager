import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.usersService.update(id, data);
    }
}

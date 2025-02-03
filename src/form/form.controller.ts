import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto, UpdateFormDto } from './form.dto';
import { form } from '@prisma/client';

@Controller('forms')
export class FormController {

    constructor(private readonly formService: FormService) {}

    private async validateForm(id: number): Promise<form> {
        const data = await this.formService.getById(id);
        if(!data) throw new BadRequestException(`Form with ${id} not found`)
        return data;
      }

    @Get()
    async getAll(): Promise<form[]> {
        return this.formService.getAll();
    }

    @Get('/:id')
    async getById(@Param('id', ParseIntPipe) id:number): Promise<form> {
        return this.validateForm(id);
    }

    @Post()
    async create(@Body() body : CreateFormDto): Promise<form> {
        return this.formService.create(body);
    }

    @Put('/:id')
    async update(
        @Body() body : UpdateFormDto,
        @Param('id', ParseIntPipe) id: number) : Promise<form> {
        await this.validateForm(id);
        return this.formService.update(id, body);
    }

     @Delete(':id')
      async remove(@Param('id', ParseIntPipe) id: number) {
        await this.validateForm(id);
        return this.formService.remove(id);
      }
}

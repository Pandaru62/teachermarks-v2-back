import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './form.dto';
import { Form } from '@prisma/client';

@Controller('forms')
export class FormController {

    constructor(private readonly formService: FormService) {}

    @Get()
    async getAll(): Promise<Form[]> {
        return this.formService.getAll();
    }

    @Get('/:id')
    async getById(@Param('id', ParseIntPipe) id:number): Promise<Form> {
        return this.formService.getById(id);
    }

    @Post()
    async create(@Body() body : CreateFormDto): Promise<Form> {
        return this.formService.create(body);
    }

}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFormDto } from './form.dto';
import { Form } from '@prisma/client';

@Injectable()
export class FormService {

    constructor(private readonly prismaService: PrismaService) {}

    async getAll(): Promise<Form[]> {
        return this.prismaService.form.findMany({})
    }

    async getById(id: number): Promise<Form> {
        return this.prismaService.form.findUnique({
        where: {id}
        })
    }

    async create(data: CreateFormDto):Promise<Form> {
        return this.prismaService.form.create({data})
    }
  
}

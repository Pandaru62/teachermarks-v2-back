import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFormDto, UpdateFormDto } from './form.dto';
import { form } from '@prisma/client';

@Injectable()
export class FormService {

    constructor(private readonly prismaService: PrismaService) {}

    async getAll(): Promise<form[]> {
        return this.prismaService.form.findMany({})
    }

    async getById(id: number): Promise<form> {
        return this.prismaService.form.findUnique({
        where: {id}
        })
    }

    async create(data: CreateFormDto):Promise<form> {
        return this.prismaService.form.create({data})
    }

    async update(id: number, data: UpdateFormDto):Promise<form> {
        return this.prismaService.form.update({
            where: {id},
            data
        })
    }

    async remove(id: number): Promise<form> {
        return this.prismaService.form.delete({
        where: {id}
        })
    }
    
  
}

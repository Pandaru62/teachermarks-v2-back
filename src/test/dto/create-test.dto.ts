import { TrimesterEnum } from 'prisma/generated/browser';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Decimal } from 'prisma/generated/internal/prismaNamespace';

export class CreateTestDto {

    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    schoolClassId: number;

    @IsNotEmpty()
    date: Date;

    @IsNotEmpty()
    @IsEnum(TrimesterEnum)
    trimester: TrimesterEnum;

    @IsNotEmpty()
    @IsNumber()
    scale: number;

    @IsNotEmpty()
    @IsNumber()
    coefficient: Decimal;

    skills: {id: number, name: string}[];

    @IsOptional()
    @IsNumber()
    testTagId: number;

}
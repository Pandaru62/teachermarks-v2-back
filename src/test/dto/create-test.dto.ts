import { TrimesterEnum } from 'prisma/generated/browser';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Decimal } from 'prisma/generated/internal/prismaNamespace';
import { Type } from 'class-transformer';

export class CreateTestSkillDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;
}

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestSkillDto)
  skills: CreateTestSkillDto[];

  @IsOptional()
  @IsNumber()
  testTagId: number;
}

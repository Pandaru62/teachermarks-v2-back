import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LevelEnum } from 'prisma/generated/enums';

export class BatchStudentTestSkillDto {
  @IsInt()
  skillId: number;

  @IsEnum(LevelEnum)
  level: LevelEnum;
}

export class BatchStudentTestItemDto {
  @IsInt()
  studentId: number;

  @IsNumber()
  mark: number;

  @IsBoolean()
  isAbsent?: boolean;

  @IsBoolean()
  isUnmarked?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchStudentTestSkillDto)
  skills: BatchStudentTestSkillDto[];
}

export class BatchUpdateStudentTestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchStudentTestItemDto)
  studentTests: BatchStudentTestItemDto[];
}

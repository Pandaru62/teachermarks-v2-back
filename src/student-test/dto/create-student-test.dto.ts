import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BatchStudentTestSkillDto } from './batch-update-student-test.dto';
import { Type } from 'class-transformer';

export class CreateStudentTestDto {
  @IsNumber()
  mark: number;

  @IsBoolean()
  isAbsent?: boolean;

  @IsBoolean()
  isUnmarked?: boolean;

  @IsOptional()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchStudentTestSkillDto)
  skills: BatchStudentTestSkillDto[];
}

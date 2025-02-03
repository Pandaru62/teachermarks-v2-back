import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentTestDto } from './create-student-test.dto';

export class UpdateStudentTestDto extends PartialType(CreateStudentTestDto) {}

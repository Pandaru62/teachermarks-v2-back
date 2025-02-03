import { Injectable } from '@nestjs/common';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { UpdateStudentTestDto } from './dto/update-student-test.dto';

@Injectable()
export class StudentTestService {
  create(createStudentTestDto: CreateStudentTestDto) {
    return 'This action adds a new studentTest';
  }

  findAll() {
    return `This action returns all studentTest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studentTest`;
  }

  update(id: number, updateStudentTestDto: UpdateStudentTestDto) {
    return `This action updates a #${id} studentTest`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentTest`;
  }
}

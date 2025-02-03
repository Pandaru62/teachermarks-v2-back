import { Module } from '@nestjs/common';
import { StudentTestService } from './student-test.service';
import { StudentTestController } from './student-test.controller';

@Module({
  controllers: [StudentTestController],
  providers: [StudentTestService],
})
export class StudentTestModule {}

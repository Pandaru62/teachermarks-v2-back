import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FormModule } from './form/form.module';
import { SchoolclassModule } from './schoolclass/schoolclass.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StudentModule } from './student/student.module';
import { TestModule } from './test/test.module';
import { StudentTestModule } from './student-test/student-test.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [PrismaModule, FormModule, SchoolclassModule, StudentModule, TestModule, SkillModule, StudentTestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

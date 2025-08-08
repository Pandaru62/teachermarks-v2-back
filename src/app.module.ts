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
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [PrismaModule, FormModule, SchoolclassModule, StudentModule, TestModule, SkillModule, StudentTestModule, AuthModule, UserModule, ReportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SchoolclassController } from './schoolclass.controller';
import { SchoolclassService } from './schoolclass.service';

@Module({
  controllers: [SchoolclassController],
  providers: [SchoolclassService]
})
export class SchoolclassModule {}

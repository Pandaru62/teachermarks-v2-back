import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { TestTagController } from './testtag.controller';
import { TestTagService } from './testtag.service';

@Module({
  imports: [PrismaModule],
  controllers: [TestTagController],
  providers: [TestTagService],
})
export class TestTagModule {}

import { Module } from "@nestjs/common";
import { SchoolclassController } from "./schoolclass.controller";
import { SchoolclassService } from "./schoolclass.service";
import { PrismaModule } from "prisma/prisma.module";


@Module({
  imports: [PrismaModule],
  controllers: [SchoolclassController],
  providers: [SchoolclassService],
})
export class SchoolclassModule {}
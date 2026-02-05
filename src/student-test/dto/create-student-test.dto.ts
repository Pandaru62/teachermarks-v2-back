import { LevelEnum } from 'prisma/generated/browser';
import { IsBoolean, IsNumber } from "class-validator";

export class CreateStudentTestDto {

    @IsNumber()
    mark: number;

    @IsBoolean()
    isAbsent?: boolean;

    @IsBoolean()
    isUnmarked?: boolean;

    comment?: string;

    skills: { 
        skillId: number;
        level: LevelEnum;
    }[]
}

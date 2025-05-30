import { TrimesterEnum } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTestDto {

    
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    schoolClassId: number;

    @IsNotEmpty()
    date: Date;

    @IsNotEmpty()
    @IsEnum(TrimesterEnum)
    trimester: TrimesterEnum;

    @IsNotEmpty()
    @IsNumber()
    scale: number;

    @IsNotEmpty()
    @IsNumber()
    coefficient: number;

    skills: number[];

}
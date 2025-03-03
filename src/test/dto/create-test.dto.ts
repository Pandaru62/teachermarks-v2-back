import { TrimesterEnum } from "@prisma/client";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTestDto {

    @IsNotEmpty()
    @IsNumber()
    schoolClassid: number;

    @IsNotEmpty()
    @IsDate()
    date: Date;

    @IsNotEmpty()
    @IsNumber()
    trimester: TrimesterEnum;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    scale: number;

    @IsNotEmpty()
    @IsNumber()
    coefficient: number;

}
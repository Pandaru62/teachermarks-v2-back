import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStudentDto {

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNumber()
    schoolClassId: number[];

}

export class CreateManyStudentsDto {

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNumber()
    schoolClassId: number;

}
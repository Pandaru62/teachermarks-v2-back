import { IsNotEmpty, IsString } from "class-validator";

export class CreateStudentDto {

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

}

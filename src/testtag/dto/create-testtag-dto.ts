import { IsNotEmpty, IsString } from "class-validator";

export class CreateTestTagDto {

    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsNotEmpty()
    @IsString()
    color: string;

}
import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateSkillDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @Length(1, 2)
    abbreviation: string;

    @IsString()
    description: string;


}

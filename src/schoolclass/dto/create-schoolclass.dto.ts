import { IsHexColor, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class CreateSchoolclassDto {

    @IsString()
    @IsNotEmpty({ message: "Un nom est requis" })
    @Length(2, 30, { message: "La classe doit faire entre 2 et 30 caractères" })
    name: string;

    @IsHexColor({ message: "Une valeur hexadécimale est attendue"})
    @IsNotEmpty()
    color: string;

    @IsNumber()
    @IsNotEmpty()
    formId: number;
}

import { PartialType } from "@nestjs/mapped-types";
import {
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";


export class CreateFormDto {
  @IsString()
  @IsNotEmpty({ message: "Un nom est requis" })
  @Length(2, 30, { message: "La classe doit faire entre 2 et 30 caractères" })
  name: string;
}

export class UpdateFormDto extends PartialType(CreateFormDto) {}
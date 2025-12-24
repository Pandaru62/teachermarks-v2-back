import { IsNotEmpty, IsString } from "class-validator";

export class CreateNotificationDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    message: string;
}

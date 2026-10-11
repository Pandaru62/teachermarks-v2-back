import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  school: string;
}

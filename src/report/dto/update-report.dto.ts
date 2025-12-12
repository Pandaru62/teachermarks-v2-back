import { TrimesterEnum } from 'prisma/generated/browser';
import { IsEnum, IsString } from 'class-validator';

export class UpdateReportDto {

    @IsEnum(TrimesterEnum)
    trimester : TrimesterEnum;

    @IsString()
    description: string;
    
}

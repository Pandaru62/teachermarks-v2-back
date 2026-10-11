import { IsEnum } from 'class-validator';
import { TrimesterEnum } from 'prisma/generated/browser';

export class UpdatePreferencesDto {
  @IsEnum(TrimesterEnum)
  current_trimester: TrimesterEnum;
}

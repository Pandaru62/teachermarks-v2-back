import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolclassDto } from './create-schoolclass.dto';
import { IsBoolean } from 'class-validator';

export class UpdateSchoolclassDto extends PartialType(CreateSchoolclassDto) {

        @IsBoolean()
        isArchived: boolean;
}

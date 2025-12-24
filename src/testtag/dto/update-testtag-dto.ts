import { PartialType } from '@nestjs/mapped-types';
import { CreateTestTagDto } from './create-testtag-dto';

export class UpdateTestTagDto extends PartialType(CreateTestTagDto) {}

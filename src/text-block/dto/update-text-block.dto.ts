import { PartialType } from '@nestjs/mapped-types';
import { CreateTextBlockDto } from './create-text-block.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTextBlockDto extends PartialType(CreateTextBlockDto) {
  @ApiProperty({ example: '1,2,3', description: 'Идентификаторы изображений, которые нужно удалить' })
  imagesToDelete?: string;
}

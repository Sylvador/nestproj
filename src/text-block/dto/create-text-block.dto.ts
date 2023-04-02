import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTextBlockDto {
  @ApiProperty({example: 'main-hero-text', description: 'Уникальное имя для поиска'})
  @IsString()
  @IsNotEmpty()
  uniqueName: string;

  @ApiProperty({example: 'Шерлок Холмс', description: 'Заголовок'})
  title: string;

  @ApiProperty({example: 'Лучший в мире детектив', description: 'содержимое текстового блока'})
  text: string;

  @ApiProperty({example: 'main-page', description: 'Название группы для поиска по группам'})
  @IsNotEmpty()
  group: string;
}

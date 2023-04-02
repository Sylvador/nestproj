import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, FileTypeValidator, ParseFilePipe, UploadedFile, UseInterceptors, UploadedFiles, ParseArrayPipe } from '@nestjs/common';
import { TextBlockService } from './text-block.service';
import { CreateTextBlockDto } from './dto/create-text-block.dto';
import { UpdateTextBlockDto } from './dto/update-text-block.dto';
import { Public, Roles } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FindTextBlockDto } from './dto/find-text-block.dto';

@Controller('text-block')
export class TextBlockController {
  constructor(private readonly textBlockService: TextBlockService) {}

  @Post('create')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('images'))
  create(@Body() createTextBlockDto: CreateTextBlockDto,
  @UploadedFiles(new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new FileTypeValidator({ fileType: 'image' }),
    ],
  })) images: Express.Multer.File[]) {
    console.log(createTextBlockDto)
    return this.textBlockService.create(createTextBlockDto, images);
  }

  @Get('find')
  @Public()
  findAll(@Query() query: FindTextBlockDto): Promise<Object[]> {
    return this.textBlockService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.textBlockService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('images'))
  update(@Param('id') id: string, @Body() updateTextBlockDto: UpdateTextBlockDto, @UploadedFiles(new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new FileTypeValidator({ fileType: 'image' }),
    ],
  })) images: Express.Multer.File[]) {
    return this.textBlockService.update(+id, updateTextBlockDto, images);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.textBlockService.remove(+id);
  }
}

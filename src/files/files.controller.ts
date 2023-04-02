import { Body, Controller, FileTypeValidator, Get, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators';
import { FilesService } from './files.service';
import { FileDto } from './dto/file.dto';
import { Files } from './files.model';
import { ApiOperation } from '@nestjs/swagger';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  @Post()
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  findFiles(@UploadedFile(new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new FileTypeValidator({ fileType: 'image' }),
    ],
  })) image: Express.Multer.File) {
    return image.originalname;
  }

  //add image as preview, return file's full path
  @Post('add-preview-image')
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  addImageAsPreview(@UploadedFile(new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new FileTypeValidator({ fileType: 'image' }),
    ],
  })) image: Express.Multer.File): Promise<string> {
    return this.filesService.addImageAsPreview(image);
  }

  //bind image to essence
  @ApiOperation({ summary: 'Связать уже добавленное превью с сущностью в таблице' })
  @Post('bind-image-to-essence')
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  bindImageToEssence(@Body() fileDto: FileDto): Promise<Files> {
    return this.filesService.bindImageToInstance(fileDto);
  }

  
  @ApiOperation({ summary: 'Очистить папку превью от изображений, с момента добавления которых прошло больше часа и которые не связаны ни с одной сущностью' })
  @Get('clean-preview-folder')
  @Public()
  cleanPreviewFolder() {
    return this.filesService.cleanPreviewFolder();
  }
}

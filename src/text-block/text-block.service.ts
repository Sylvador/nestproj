import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTextBlockDto } from './dto/create-text-block.dto';
import { UpdateTextBlockDto } from './dto/update-text-block.dto';
import { TextBlock } from './text-block.model';
import { InjectModel } from '@nestjs/sequelize';
import { FilesService } from 'src/files/files.service';
import { ValidationError } from 'sequelize';
import { FindTextBlockDto } from './dto/find-text-block.dto';

@Injectable()
export class TextBlockService {
  constructor(@InjectModel(TextBlock) private textBlockRepository: typeof TextBlock,
  private filesService: FilesService) {}
  async create(createTextBlockDto: CreateTextBlockDto, images: Express.Multer.File[]): Promise<TextBlock> {
    try {
      const textBlock: TextBlock = await this.textBlockRepository.create({ ...createTextBlockDto });

      if (images) { 
        images.forEach(async image => await this.filesService.createFile(image, {folderName: 'text-block-images', essenceId: textBlock.id, essenceTable: 'text-blocks'}));
      }

      return textBlock;
    } catch (error) {
      if (error instanceof ValidationError) throw new HttpException(error.errors[0].message, HttpStatus.BAD_REQUEST)
      throw error;
    }
  }

  async findAll(query: FindTextBlockDto) {
    const textBlocks: TextBlock[] = await this.textBlockRepository.findAll({ where: { ...query }});
    const textBlocksWithImages = await Promise.all(textBlocks.map(async textBlock => {
      const images = await this.filesService.findFiles(textBlock.id, 'text-blocks');
      const imagesPath = images.map(image => { 
        return { filePath: image.filePath }
      })
      return { textBlock, images };
    }))
    console.log(textBlocksWithImages)
    return textBlocksWithImages;
  }

  async findOne(id: number) {
    return await this.textBlockRepository.findByPk(id);
  }

  async update(id: number, updateTextBlockDto: UpdateTextBlockDto, images?: Express.Multer.File[]) {
    let textBlock: TextBlock;
    if (id) {
      textBlock = await this.textBlockRepository.findByPk(id);
    } else {
      textBlock = await this.textBlockRepository.findOne({ where: { uniqueName: updateTextBlockDto.uniqueName }});
    }

    if (updateTextBlockDto.imagesToDelete) {
      const ids = updateTextBlockDto.imagesToDelete.split(',');
      await this.filesService.deleteFilesById(ids);
    }
    if (images) { 
      images.forEach(async image => await this.filesService.createFile(image, {folderName: 'text-block-images', essenceId: textBlock.id, essenceTable: 'text-blocks'}));
    }
    
    return await textBlock.update({...updateTextBlockDto});
  }

  async remove(id: number) {
    await this.filesService.deleteFiles(id, 'text-blocks');
    return await this.textBlockRepository.destroy({ where: { id }});
  }
}

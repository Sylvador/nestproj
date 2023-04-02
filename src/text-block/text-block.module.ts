import { Module } from '@nestjs/common';
import { TextBlockService } from './text-block.service';
import { TextBlockController } from './text-block.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TextBlock } from './text-block.model';
import { FilesModule } from 'src/files/files.module';

@Module({
  controllers: [TextBlockController],
  providers: [TextBlockService],
  imports: [SequelizeModule.forFeature([TextBlock]), FilesModule]
})
export class TextBlockModule {}

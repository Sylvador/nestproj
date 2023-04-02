import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './profile.model';
import { AuthModule } from 'src/auth/auth.module';
import { FilesModule } from 'src/files/files.module';
import { RtStrategy } from 'src/auth/strategies';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, RtStrategy],
  imports: [
    SequelizeModule.forFeature([Profile]),
    AuthModule,
    FilesModule,
  ],
  exports: [
    ProfileService,
  ]
})
export class ProfileModule {}

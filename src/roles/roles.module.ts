import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/user.model';
import { Role } from './roles.model';
import { UserRoles } from './user-roles.model';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    SequelizeModule.forFeature([Role, User, UserRoles]),
    ProfileModule
  ],
  exports: [
    RolesService,
  ]
})
export class RolesModule {}

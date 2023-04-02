import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from 'src/roles/roles.model';
import { RolesModule } from 'src/roles/roles.module';
import { UserRoles } from 'src/roles/user-roles.model';
import { User } from './user.model';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';

@Module({
  controllers: [UserController],
  providers: [UserService, AtStrategy, RtStrategy],
  imports: [
    SequelizeModule.forFeature([User, Role, UserRoles]),
    RolesModule,
  ],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { TextBlockModule } from './text-block/text-block.module';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize/dist';
import { User } from './user/user.model';
import { Role } from './roles/roles.model';
import { UserRoles } from './roles/user-roles.model';
import { Profile } from './profile/profile.model';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { TextBlock } from './text-block/text-block.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User, Role, UserRoles, Profile, TextBlock],
      autoLoadModels: true,
    }),
    UserModule,
    ProfileModule,
    AuthModule,
    RolesModule,
    TextBlockModule,
    FilesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}

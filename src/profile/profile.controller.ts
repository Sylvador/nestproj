import { Controller, Post, Body, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, Req, Patch, Param, Get, UseGuards, ValidationPipe, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Tokens } from 'src/auth/types';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { GetCurrentUser, GetCurrentUserId, Public, Roles } from 'src/common/decorators';
import { ProfileUpdateGuard } from 'src/common/guards/profile-update.guard';
import { RtGuard } from 'src/common/guards';
import { ApiOperation } from '@nestjs/swagger';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  //invoke authService.signup, create user & profile, return tokens
  @Post('signup')
  @Public()
  @UseInterceptors(FileInterceptor('profilePic'))
  signup(@Body() createProfileDto: CreateProfileDto,
  @UploadedFile(new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new FileTypeValidator({ fileType: 'image' }),
    ],
  })) profilePic: Express.Multer.File): Promise<Tokens> {
    return this.profileService.signup(createProfileDto, profilePic);
  }

  @Post('signin')
  @Public()
  signin(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.profileService.signin(authDto);
  }

  @ApiOperation({ summary: 'Обновить токены' })
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.profileService.refreshTokens(userId, refreshToken);
  }
  
  @Patch(':id')
  @UseGuards(ProfileUpdateGuard)
  updateProfile(@Param('id') id: string, @Body('updateProfileDto') updateProfileDto: UpdateProfileDto, @Body('updateUserDto') updateUserDto: AuthDto) {
    return this.profileService.update(+id, updateProfileDto, updateUserDto);
  }


  @Patch('profile-pic/:id')
  @UseGuards(ProfileUpdateGuard)
  @UseInterceptors(FileInterceptor('profilePic'))
  updateProfilePic(@Param('id') id: string, @UploadedFile(new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new FileTypeValidator({ fileType: 'image' }),
    ],
  })) profilePic: Express.Multer.File) {
    return this.profileService.updateProfilePic(+id, profilePic);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.profileService.getUserById(+id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(ProfileUpdateGuard)
  removeUser(@Param('id') id: string) {
    return this.profileService.removeUser(+id);
  }
}

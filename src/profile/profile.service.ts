import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AuthService } from 'src/auth/auth.service';
import { Tokens } from 'src/auth/types';
import { InjectModel } from '@nestjs/sequelize';
import { Profile } from './profile.model';
import { FilesService } from 'src/files/files.service';
import { User } from 'src/user/user.model';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { ValidationError } from 'sequelize';

@Injectable()
export class ProfileService {
  
  constructor(@InjectModel(Profile) private profileRepository: typeof Profile,
  private authService: AuthService,
  private fileService: FilesService) {}
  
  //create user, invoke createProfile, get tokens
  async signup(profileDto: CreateProfileDto, profilePic?: Express.Multer.File): Promise<Tokens> {
    let user: User;
    try {
      const usernameTaken = await this.profileRepository.findOne({ where: { username: profileDto.username }});
      if (usernameTaken) {
        throw new HttpException('Пользователь с таким username уже существует', HttpStatus.BAD_REQUEST);
      }

      user = await this.authService.createUser(profileDto);
      //generate tokens
      const tokens: Tokens = await this.authService.generateTokens(user, profileDto.email);
      await this.authService.updateRtHash(user.id, tokens.refreshToken);
      //bind profile to user
      const profile: Profile = await this.createProfile(profileDto, user.id, profilePic);
      await user.$set('profile', profile);
      user.profile = profile

      return tokens;
    } catch (error) {
      console.log('Ошибка')
      if (user) {
        console.log(error)
        user.destroy();
      }
      throw error;
    }
  }
  
  async signin(authDto: AuthDto): Promise<Tokens> {
    const tokens = await this.authService.signin(authDto?.email, authDto?.password);
    return tokens;
  }
  
  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    return await this.authService.refreshTokens(userId, refreshToken);
  }
  //create profile for userId
  async createProfile(profileDto: CreateProfileDto, userId: number, profilePic?: Express.Multer.File,): Promise<Profile> {
    const profile = await this.profileRepository.create({...profileDto, userId });
    
    if (profilePic) {
      const fileName = await this.fileService.createFile(profilePic, {folderName: 'profile-pictures', essenceId: profile.id, essenceTable: 'profiles'});
      profile.profilePic = fileName;
      profile.save();
    }
    
    return profile;
  }

  async updateProfilePic(userId: number, profilePic: Express.Multer.File) {
    const profile = await this.profileRepository.findOne({ where: { userId }});
    
    await this.fileService.deleteFile(profile.profilePic);

    const fileName = await this.fileService.createFile(profilePic, {essenceTable: 'profile-pictures', essenceId: profile.id, folderName: 'profiles'});

    profile.profilePic = fileName;

    profile.save();
  }

  async update(userId: number, profileDto: UpdateProfileDto, updateUserDto: AuthDto) {
    const user = await this.profileRepository.findOne({ where: { userId }, include: User});
    if (!user) throw new HttpException('Пользователь не найден', HttpStatus.BAD_REQUEST);
    
    //update profile
    if (profileDto) {
      for (const [key, value] of Object.entries(profileDto)) {
        if ((key in user) && key !== 'user') {
          user[key] = value;
        }
      }
    }
    //update email and password
    if (updateUserDto) {
      const error = await this.authService.updateUser(userId, updateUserDto);
      if (error) {
        throw new HttpException(error.errors[0].message, HttpStatus.BAD_REQUEST);
      }
    }
    try {
      await user.save();
    } catch (error) {
      if (error instanceof ValidationError) throw new HttpException(error.errors[0].message, HttpStatus.BAD_REQUEST);
    }

    //bug?: returns not updated email and password, but has it actually updated
    return user;
  }
  
  async getUserById(userId: number) {
    return await this.profileRepository.findOne({ where: { userId }, include: { all: true }});
  }

  async removeUser(userId: number) {
    const user = await this.profileRepository.findByPk(userId);
    this.authService.removeUser(userId);
    user.destroy();
    this.fileService.deleteFile(user.profilePic);
  }
}

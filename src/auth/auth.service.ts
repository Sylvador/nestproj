import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/user.model';
import *  as argon from 'argon2';
import { JwtPayload, Tokens } from './types';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { ValidationError } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User) private userRepository: typeof User,
  private jwtService: JwtService,
  private config: ConfigService) { }
  
  //create user instance, return userId
  async createUser(userDto: CreateUserDto): Promise<User> {
    const candidate = await this.userRepository.findOne({ where: { email: userDto.email } });
    if (candidate) {
      throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await argon.hash(userDto.password);
    const newUser = await this.userRepository.create({ ...userDto, hashedPassword })
    return newUser;
  }

  async signin(email: string, password: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({ where: { email }, include: { all: true } });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const passwordMatch = await argon.verify(user.hashedPassword, password);
    if(!passwordMatch) {
      throw new ForbiddenException('Неверный логин или пароль');
    }

    const tokens = await this.generateTokens(user, email);
    
    await this.updateRtHash(user.id, tokens.refreshToken);
    
    return tokens;
  }
  
  async generateTokens(user: User, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email,
      roles: user.roles
    }
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        jwtPayload,
        {
          expiresIn: '15m',
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET_KEY'),
        }),
      this.jwtService.signAsync(
        jwtPayload,
        {
          expiresIn: '7d',
          secret: this.config.get<string>('REFRESH_TOKEN_SECRET_KEY'),
        }
        )
      ]);
      return {
      accessToken,
      refreshToken
    };
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userRepository.findByPk(userId);
    if (!user?.hashedRt) {
      console.log(userId)
      throw new ForbiddenException('Access Denied');
    }
    console.log('**************')
    const rtMatches = argon.verify(user.hashedRt, rt);
    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }
    console.log('**************')
    const tokens = await this.generateTokens(user, user.email);
    await this.updateRtHash(userId, tokens.refreshToken);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hashedRt = await argon.hash(rt);
    await this.userRepository.update({ hashedRt }, { where: { id: userId } });
  
  }

  async updateUser(userId: number, authDto: AuthDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
  
      if (authDto.password) {
        await this.changePassword(userId, authDto.password);
      }
  
      for (const [key, value] of Object.entries(authDto)) {
        if (key in user) {
          console.log('true')
          user[key] = value;
        }
      }
  
      await user.save();
    } catch (error) {
      if (error instanceof ValidationError) return error;
      throw error;
    }
  }

  async changePassword(userId: number, password: string) {
    const hashedPassword = await argon.hash(password);

    await this.userRepository.update({ hashedPassword }, { where: { id: userId } });
  }

  async removeUser(userId: number) {
    await this.userRepository.destroy({ where: { id: userId }});
  }
}

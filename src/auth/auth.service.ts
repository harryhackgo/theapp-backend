import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { comparePassword, hashPassword } from '../utils/hash';
import { JwtService } from '@nestjs/jwt';
import { getUniqIdValue } from '../utils/uniq';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(payload: CreateAuthDto) {
    try {
      const hashed = await hashPassword(payload.password);
      const verifyToken = getUniqIdValue('v_');

      const user = await this.prisma.user.create({
        data: {
          fullName: payload.fullName,
          email: payload.email,
          password: hashed,
          corporationName: payload.corporationName || null,
          status: 'UNVERIFIED',
          verifyToken,
        },
      });

      const verifyLink = `${this.config.get('APP_URL')}${this.config.get('PORT')}/auth/verify/${verifyToken}`;
      const html = `Please click <a href="${verifyLink}">here</a> to verify your account.`;
      await this.mailService.sendMail(user.email, 'Verify your account', html);

      return { message: 'Registered. Check email for verification.' };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const target = err.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
      }
      throw new BadRequestException('Error registering user: ' + err.message);
    }
  }

  async verifyToken(token: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { verifyToken: token },
      });
      if (!user) throw new UnauthorizedException('Invalid token');

      if (user.status !== 'BLOCKED') {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE', verifyToken: null },
        });
        return { message: 'Account activated' };
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { verifyToken: null },
        });
        return { message: 'Account remains blocked' };
      }
    } catch (error) {
      throw new BadRequestException('Error verifying token: ' + error.message);
    }
  }

  async login(email: string, password: string, rememberMe = false) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new UnauthorizedException('Invalid credentials');
      if (user.status === 'BLOCKED') {
        throw new ForbiddenException('User is blocked');
      }

      const ok = await comparePassword(password, user.password);
      if (!ok) throw new UnauthorizedException('Invalid credentials');

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const payload = { sub: user.id, email: user.email, status: user.status };
      const token = this.jwtService.sign(payload, {
        expiresIn: rememberMe
          ? this.config.get('JWT_EXPIRATION_LONG')
          : this.config.get('JWT_EXPIRATION_SHORT'),
      });

      return {
        accessToken: token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          status: user.status,
        },
      };
    } catch (error) {
      throw new BadRequestException('Error login in: ' + error.message);
    }
  }
}

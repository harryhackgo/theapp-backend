// src/auth/jwt.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException();

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!dbUser) throw new UnauthorizedException('User no longer exists');

    if (dbUser.status === 'BLOCKED')
      throw new UnauthorizedException('User is blocked');
    else if (dbUser.status === 'UNVERIFIED')
      throw new UnauthorizedException('User is not verified');
    request.dbUser = dbUser;
    return true;
  }
}

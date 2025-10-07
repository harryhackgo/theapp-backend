import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async listAll() {
    try {
      return this.prisma.user.findMany({
        orderBy: [{ lastLogin: 'desc' }, { createdAt: 'desc' }],
        omit: { password: true, verifyToken: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while getting user(s)',
        error.message,
      );
    }
  }

  async blockUsers(ids: string[]) {
    try {
      await this.prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { status: 'BLOCKED' },
      });
      return { message: 'Blocked' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while blocking user(s)',
        error.message,
      );
    }
  }

  async unblockUsers(ids: string[]) {
    try {
      await this.prisma.$transaction([
        this.prisma.user.updateMany({
          where: { id: { in: ids }, verifyToken: null },
          data: { status: 'ACTIVE' },
        }),
        this.prisma.user.updateMany({
          where: { id: { in: ids }, NOT: { verifyToken: null } },
          data: { status: 'UNVERIFIED' },
        }),
      ]);
      return { message: 'Unblocked' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while unblocking user(s)',
        error.message,
      );
    }
  }

  async deleteUsers(ids: string[]) {
    try {
      await this.prisma.user.deleteMany({ where: { id: { in: ids } } });
      return { message: 'Deleted' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while deleting user(s)',
        error.message,
      );
    }
  }

  async deleteUnverified() {
    try {
      await this.prisma.user.deleteMany({ where: { status: 'UNVERIFIED' } });
      return { message: 'Deleted unverified' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while deleting unverified user(s)',
        error.message,
      );
    }
  }
}

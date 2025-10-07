import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved users list.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async list() {
    return this.svc.listAll();
  }

  @Patch('block')
  @ApiOperation({ summary: 'Block multiple users' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      valid: {
        summary: 'Example body',
        value: { ids: ['123abc', '456def'] },
      },
      empty: {
        summary: 'Empty list',
        value: { ids: [] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Users blocked successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation error: ids must be an array of strings.',
  })
  async block(@Body() body: UpdateUserDto) {
    return this.svc.blockUsers(body.ids || []);
  }

  @Patch('unblock')
  @ApiOperation({ summary: 'Unblock multiple users' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      valid: {
        summary: 'Example body',
        value: { ids: ['789ghi', '321jkl'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Users unblocked successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation error: ids must be an array of strings.',
  })
  async unblock(@Body() body: UpdateUserDto) {
    return this.svc.unblockUsers(body.ids || []);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple users' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      valid: {
        summary: 'Example body',
        value: { ids: ['654mno', '987pqr'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Users deleted successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation error: ids must be an array of strings.',
  })
  async delete(@Body() body: UpdateUserDto) {
    return this.svc.deleteUsers(body.ids || []);
  }

  @Delete('unverified')
  @ApiOperation({ summary: 'Delete all unverified users' })
  @ApiResponse({
    status: 200,
    description: 'Unverified users deleted successfully.',
  })
  async deleteUnverified() {
    return this.svc.deleteUnverified();
  }
}

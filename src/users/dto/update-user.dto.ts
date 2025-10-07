import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: ['a1b2c3d4', 'e5f6g7h8'],
    description: 'List of user IDs to be updated',
    required: true,
    type: [String],
  })
  @IsArray({ message: 'ids must be an array' })
  @IsString({ each: true, message: 'each id must be a string' })
  ids: string[];
}

import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshToken {
  id!: number;
  token!: string;
  userId!: number;
  expiresAt!: Date;
  createdAt!: Date;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  lastName!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50)
  @Matches(/(?=.*[a-z])/, { message: 'Debe contener al menos una minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'Debe contener al menos una mayúscula' })
  @Matches(/(?=.*\d)/, { message: 'Debe contener al menos un número' })
  @Matches(/(?=.*[\W_])/, { message: 'Debe contener al menos un carácter especial' })
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  role?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/(?=.*[a-z])/, { message: 'Debe contener al menos una letra minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'Debe contener al menos una letra mayúscula' })
  @Matches(/(?=.*\d)/, { message: 'Debe contener al menos un número' })
  @Matches(/(?=.*[\W_])/, { message: 'Debe contener al menos un carácter especial' })
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  role?: string;
}

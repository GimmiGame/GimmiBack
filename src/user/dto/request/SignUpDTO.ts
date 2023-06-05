import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class SignUpDTO {
  @ApiProperty({
    description: 'The pseudo of the user. Must be unique',
    default: 'testPseudo'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  pseudo: string;

  @ApiProperty({
    description: 'The email of the user. Optional but unique',
  })
  @IsEmail()
  @IsOptional()
  email: string | null;

  @ApiProperty({
    description: 'The password of the user',
    default: 'testPassword'
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 30)
  password: string;
}
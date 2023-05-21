import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class AuthCredentialsDTO{
  @ApiProperty({
    description: 'The pseudo of the user. Must be unique',
    default: 'testPseudo'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  pseudo: string;

  @ApiProperty({
    description: 'The password of the user',
    default: 'testPassword'
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 30)
  password: string;
}
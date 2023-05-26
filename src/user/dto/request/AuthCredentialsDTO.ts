import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class AuthCredentialsDTO{
  @ApiProperty({
    description: 'The pseudo of the user. Must be unique and length between 3 and 20',
    default: 'testPseudo'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  pseudo: string;

  @ApiProperty({
    description: 'The password of the user. Length between 4 and 30',
    default: 'testPassword'
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 30)
  password: string;
}
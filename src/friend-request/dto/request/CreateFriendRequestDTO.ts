import { IsNotEmpty ,IsString} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateFriendRequestDTO {
  //ApiProperty is used to generate the documentation on swagger. Its value is the description of the field
  //Put the @ApiProperty() decorator on every field of the DTO
  //Can also describe and put default values on optional fields like below

  @ApiProperty({
    description: 'The pseudo of the user who sent the friend request',
    default: 'Mouss'
  })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty({
    description: 'The pseudo of the user who received the friend request',
    default: 'toto'
  })
  @IsNotEmpty()
  @IsString()
  to: string;

}
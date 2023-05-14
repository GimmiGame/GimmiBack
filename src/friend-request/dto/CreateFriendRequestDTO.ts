import { IsNotEmpty ,IsString} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateFriendRequestDTO {
  //ApiProperty is used to generate the documentation on swagger. Its value is the description of the field
  //Put the @ApiProperty() decorator on every field of the DTO
  //Can also describe and put default values on optional fields like below

  @ApiProperty({
    description: 'The usernameId of the user who sent the friend request',
    default: 'dsbdfbshb_USERID_TEST_gfopxopmc'
  })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  to: string;

}
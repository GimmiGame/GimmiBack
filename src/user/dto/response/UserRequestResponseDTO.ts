import { ApiProperty } from "@nestjs/swagger";
export class UserRequestResponseDTO {
  @ApiProperty({
    type: String,
  })
  _id: string;

  @ApiProperty({
    type: String
  })
  pseudo: string;

  @ApiProperty({
    type: String
  })
  email: string;

  @ApiProperty({
    type: String
  })
  description: string;

  @ApiProperty({
    type: String
  })
  status: string;

}
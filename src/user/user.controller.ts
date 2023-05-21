import {
  Body,
  ConflictException,
  Controller, HttpException,
  InternalServerErrorException,
  Post,
  UnauthorizedException
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateUserDTO } from "./dto/request/CreateUserDTO";
import { UserService } from "./user.service";
import { AuthCredentialsDTO } from "./dto/request/AuthCredentialsDTO";

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDTO
  })
  //TODO: add response token
  async signUp(@Body() createUserDTO: CreateUserDTO) {
    try {
      return await this.userService.create(createUserDTO);
    } catch (error) {
      switch(error.code) {
        case 409:
          throw new ConflictException(error.message);
        case 500:
          throw new InternalServerErrorException(error.message);
        default:
          throw new HttpException('An error occured while creating the user : '+error.message, 500);
      }
    }
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in as a user' })
  @ApiBody({
    type: AuthCredentialsDTO
  })
  async signIn(@Body() authCredentialsDTO: AuthCredentialsDTO) {
    try {
      return await this.userService.signIn(authCredentialsDTO);
    } catch (error) {
      switch(error.code) {
        case 401:
          throw new UnauthorizedException(error.message);
        case 500:
          throw new InternalServerErrorException(error.message);
        default:
          throw new InternalServerErrorException('An error occured while signing in');
      }
    }
  }
}

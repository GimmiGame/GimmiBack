import {
  Body,
  ConflictException,
  Controller, Get, HttpException,
  InternalServerErrorException, NotFoundException, Param, Patch,
  Post,
  UnauthorizedException
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { AuthCredentialsDTO } from "./dto/request/AuthCredentialsDTO";
import { IToken } from "../_interfaces/IToken";
import { SignUpDTO } from "./dto/request/SignUpDTO";

import { UserRequestResponseDTO } from "./dto/response/UserRequestResponseDTO";

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: SignUpDTO
  })

  async signUp(@Body() signUpDTO: SignUpDTO) : Promise<IToken>{
    try {
      return await this.userService.create(signUpDTO);
    } catch (error) {
      switch(error.statusCode) {
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
  async signIn(@Body() authCredentialsDTO: AuthCredentialsDTO) : Promise<IToken>{
    try {
      return await this.userService.signIn(authCredentialsDTO);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Patch('signout/:pseudo')
  @ApiOperation({ summary: 'Sign out as a user' })
  @ApiParam({
    name: 'pseudo',
    type: String,
    schema: {
      default: 'testPseudo'
    }
  })
  async signOut(@Param('pseudo') pseudo: string) : Promise<void>{
    try {
      await this.userService.signOut(pseudo);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'The users have been successfully retrieved.',
    type: UserRequestResponseDTO
  })
  async getAllUsers() : Promise<UserRequestResponseDTO[]>{
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('pseudo/:pseudo')
  @ApiOperation({ summary: 'Get a user by its pseudo' })
  @ApiParam({
    name: 'pseudo',
    type: String,
    schema: {
      default: 'testPseudo'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully retrieved.',
    type: UserRequestResponseDTO
  })
  async getUserByPseudo(@Param('pseudo') pseudo: string) : Promise<UserRequestResponseDTO>{
    try {
      return await this.userService.getUserByPseudo(pseudo);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

}

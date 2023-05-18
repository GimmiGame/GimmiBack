import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  ValidationPipe,
  BadRequestException,
  UsePipes, NotFoundException
} from "@nestjs/common";
import { FriendRequestService } from "./friend-request.service";
import { CreateFriendRequestDTO } from "./dto/CreateFriendRequestDTO";
import { ApiOperation, ApiParam, ApiProperty, ApiTags } from "@nestjs/swagger";

@Controller('friend-requests') //This is the path that will be used to access the controller
@ApiTags('Friend Request') //SWAGGER : This is the name of the tag (onglet) that will be shown on swagger for this controller
@UsePipes(ValidationPipe) //This will validate the type of DTOs that are being passed into the controller like @isString() or @isNotEmpty()
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Get('all')
  @ApiOperation({ //SWAGGER : This is the description that will be shown on swagger for this route
    description: 'Get all friend requests',
  })
  async getAllFriendRequests() {
    try {
      return await this.friendRequestService.getAllFriendRequests();
    } catch (err) {
        throw new NotFoundException('Could not get all friend requests. Error: ' + err.message);
    }
  }

  @Get('id/:_id')
  @ApiOperation({
    description: 'The id of the friend request',
  })
  @ApiParam({ //SWAGGER : This is the default value that will be shown on swagger for this parameter
    name: '_id',
    schema: {
      default: '6461623bda2f1e3425116ed4',
    }
  })
  async getFriendRequestById(@Param('_id') _id: string ) { // We give a default value to _id so that we can test the route on swagger
    try {
      return await this.friendRequestService.getOneById(_id);
    } catch (err) {
        throw new NotFoundException('Could not get friend request. Error: ' + err.message);
    }
  }

  @Get('from/:from')
  @ApiOperation({
    description: 'The pseudo of the user who sent the friend request',
  })
  @ApiParam({
    name: 'from',
    schema: {
      default: 'dsbdfbshb_USERID_TEST_gfopxopmc',
    }
  })
  async getAllFriendRequestsFrom(@Param('from') from: string ) {
    try {
      return await this.friendRequestService.getFriendRequestsFrom(from);
    } catch (err) {
        throw new NotFoundException('Could not get friend requests from this user. Error: ' + err.message);
    }
  }

  @Get('to/:to')
  @ApiOperation({
    description: 'The pseudo of the user who received the friend request',
  })
  @ApiParam({
    name: 'to',
    schema: {
      default: 'test',
    }
  })
  async getAllFriendRequestsSentTo(@Param('to') to: string) {
    try {
      return await this.friendRequestService.getFriendRequestsSentTo(to);
    } catch (err) {
        throw new NotFoundException('Could not get friend requests sent to this user. Error: ' + err.message);
    }
  }


  @Post('create')
  @ApiOperation({
    description: 'Create a new friend request',
  })
  async createRequest(@Body() createFriendRequestDTO: CreateFriendRequestDTO) {
    try {
      return await this.friendRequestService.createRequest(createFriendRequestDTO);
    } catch (err) {
        throw new BadRequestException('Could not create new friend request. Error: ' + err.message);
    }
  }

  @Patch('accept/:_id')
  @ApiOperation({
    description: 'Accept a friend request',
  })
  @ApiParam({
    name: '_id',
    schema: {
      default: '64616c31fc1e0bf18ae3c6dc',
    }
  })
  async acceptRequest(@Param('_id') _id: string) {
    try {
      return await this.friendRequestService.acceptRequest(_id);
    } catch (err) {
        throw new BadRequestException('Could not accept friend request. Error: ' + err.message);
    }
  }

  @Patch('refuse/:_id')
  @ApiOperation({
    description: 'Refuse a friend request',
  })
  @ApiParam({
    name: '_id',
    schema: {
      default: '64616c31fc1e0bf18ae3c6dc',
    }
  })
  async refuseRequest(@Param('_id') _id: string) {
    try {
      return await this.friendRequestService.refuseRequest(_id);
    } catch (err) {
        throw new BadRequestException('Could not reject friend request. Error: ' + err.message);
    }
  }





}

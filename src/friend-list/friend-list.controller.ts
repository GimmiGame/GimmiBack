import {
  ConflictException,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Post
} from "@nestjs/common";
import { FriendListService } from "./friend-list.service";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { IFriendList } from "../_interfaces/IFriendList";

@Controller('friend-lists')
@ApiTags('Friend List')
export class FriendListController {
  constructor (private readonly friendListService: FriendListService){}

  @Get()
  @ApiOperation({ summary: 'Get all friend lists' })
  async getAllFriendLists() {
    try {
      return await this.friendListService.getAllFriendLists();
    }
    catch (error) {
      throw new NotFoundException("No friend list found. Details => " + error.message)
    }
  }

  @Get('/:owner')
  @ApiOperation({ summary: 'Get a friend list' })
  @ApiParam({
    name: 'owner',
    description: 'The pseudo of the owner of the friend list',
    type: String
  })
  async getOneFriendList(@Param('owner') owner: string) : Promise<IFriendList> {
    try {
      return await this.friendListService.getOneFriendList(owner);
    }
    catch (error) {
      throw new NotFoundException("Friend list not found fro this user. Details => " + error.message)
    }
  }

  @Post('/create/:owner')
  @ApiOperation({ summary: 'Create a new friend list' })
  @ApiParam({
    name: 'owner',
    description: 'The pseudo of the owner of the friend list',
    type: String
  })
  async createFriendList(@Param('owner') owner: string)  : Promise<IFriendList> {
    try {
      return await this.friendListService.createFriendList(owner);
    }
    catch (error) {
      throw new ConflictException('Cannot create friend list. Details => ' + error.message)
    }

  }

  @Patch('/add-friend/:owner/:friend')
  @ApiOperation({ summary: 'Add a friend to a friend list' })
  @ApiParam({
    name: 'owner',
    description: 'The pseudo of the owner of the friend list',
    type: String
  })
  @ApiParam({
    name: 'friend',
    description: 'The pseudo of the friend to add',
    type: String
  })
  async addFriend(@Param('owner') owner: string, @Param('friend') friend: string)  : Promise<IFriendList> {
    try {
      return await this.friendListService.addFriendToList(owner, friend);
    }
    catch (error) {
      throw new ConflictException('Cannot add friend. Details => ' + error.message)
    }
  }

  @Patch('/remove-friend/:owner/:friend')
  @ApiOperation({ summary: 'Remove a friend from a friend list' })
  @ApiParam({
    name: 'owner',
    description: 'The pseudo of the owner of the friend list',
    type: String
  })
  @ApiParam({
    name: 'friend',
    description: 'The pseudo of the friend to remove',
    type: String
  })
  async removeFriend(@Param('owner') owner: string, @Param('friend') friend: string)  : Promise<IFriendList> {
    try {
      return await this.friendListService.removeFriendFromList(owner, friend);
    }
    catch (error) {
      throw new ConflictException('Cannot remove friend. Details => ' + error.message)
    }
  }




}

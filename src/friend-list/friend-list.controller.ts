import {
  ConflictException,
  Controller, Delete,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Post
} from "@nestjs/common";
import { FriendListService } from "./friend-list.service";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IFriendList } from "../_interfaces/IFriendList";

@Controller('friend-lists')
@ApiTags('Friend List')
export class FriendListController {
  constructor (private readonly friendListService: FriendListService){}

  @Get('all')
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

  @Patch('/add-friendship/:friend1/:friend2')
  @ApiOperation({ summary: 'Add a friendship between two users by adding both in their friendLists' })
  @ApiParam({
    name: 'friend1',
    description: 'The pseudo of the first friend',
    type: String
  })
  @ApiParam({
    name: 'friend2',
    description: 'The pseudo of the second friend',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'The friendship has been successfully added',
  })
  async addFriendship(@Param('friend1') friend1: string, @Param('friend2') friend2: string)  : Promise<void> {
    try {
      return await this.friendListService.acceptFriendshipOfUsers(friend1, friend2);
    }
    catch (error) {
      throw new ConflictException('Cannot add friendship. Details => ' + error.message)
    }
  }

  @Delete('suppress-friendship/:friend1/:friend2')
  @ApiOperation({ summary: 'Remove a friendship between two users by removing both in their friendLists' })
  @ApiParam({
    name: 'friend1',
    description: 'The pseudo of the first friend',
    type: String
  })
  @ApiParam({
    name: 'friend2',
    description: 'The pseudo of the second friend',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'The friendship has been successfully removed',
  })
  async suppressFriendship(@Param('friend1') friend1: string, @Param('friend2') friend2: string)  : Promise<void> {
    try {
      return await this.friendListService.suppressFriendshipOfUsers(friend1, friend2);
    }
    catch (error) {
      throw new ConflictException('Cannot suppress friendship. Details => ' + error.message)
    }
  }

  @Post('/create/:owner')
  @ApiOperation({ summary: 'Create a new friend list' })
  @ApiParam({
    name: 'owner',
    description: 'The pseudo of the owner of the friend list',
    type: String
  })
  @ApiResponse({
    status: 201,
    description: 'The friend list has been successfully created',
  })
  async createFriendList(@Param('owner') owner: string)  : Promise<void> {
    try {
      return await this.friendListService.createFriendList(owner);
    }
    catch (error) {
      throw new ConflictException('Cannot create friend list. Details => ' + error.message)
    }

  }

  // IF NEEDED , UNCOMMENT THIS CODE
  /*@Patch('/add-friend/:owner/:friend')
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
  async addFriend(@Param('owner') owner: string, @Param('friend') friend: string)  : Promise<String> {
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
  async removeFriend(@Param('owner') owner: string, @Param('friend') friend: string)  : Promise<String> {
    try {
      return await this.friendListService.removeFriendFromList(owner, friend);
    }
    catch (error) {
      throw new ConflictException('Cannot remove friend. Details => ' + error.message)
    }
  }*/



}

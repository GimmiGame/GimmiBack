import { Controller, Get, HttpException, NotFoundException, Param, Post } from "@nestjs/common";
import { FriendListService } from "./friend-list.service";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

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

  @Post('/create/:owner')
  @ApiOperation({ summary: 'Create a new friend list' })
  @ApiParam({
    name: 'owner',
    description: 'The pseudo of the owner of the friend list',
    type: String
  })
  async createFriendList(@Param('owner') owner: string) {
    try {
      return await this.friendListService.createFriendList(owner);
    }
    catch (error) {
      throw new HttpException("Could not create friend list. Details => " + error.message, 500)
    }

  }




}

import { Body, Controller, Post, Get, Param, Patch, Delete, ValidationPipe, BadRequestException } from "@nestjs/common";
import { FriendRequestService } from "./friend-request.service";
import { CreateFriendRequestDTO } from "./dto/CreateFriendRequestDTO";

@Controller('friend-requests') //This is the path that will be used to access the controller
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post('create')
  async createRequest(@Body(ValidationPipe) createFriendRequestDTO: CreateFriendRequestDTO) {
    try {
      return await this.friendRequestService.createRequest(createFriendRequestDTO);
    } catch (err) {
        throw new BadRequestException('Could not create new friend request. Error: ' + err.message);
    }
  }



}

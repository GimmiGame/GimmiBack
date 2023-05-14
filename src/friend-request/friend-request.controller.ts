import { Body, Controller, Post, Get, Param, Patch, Delete, ValidationPipe } from "@nestjs/common";
import { FriendRequestService } from "./friend-request.service";
import { CreateFriendRequestDTO } from "./dto/CreateFriendRequestDTO";

@Controller('friend-requests') //This is the path that will be used to access the controller
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  createRequest(@Body(ValidationPipe) createFriendRequestDTO : CreateFriendRequestDTO ) { //ValidationPipe verifies that the body of the request follows the rules specified in the DTO
    return this.friendRequestService.createRequest(createFriendRequestDTO)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return {
          error : err.message()
        };
      });
  }
}

import { Body, Controller, Post, Get, Param, Patch, Delete } from "@nestjs/common";
import { FriendRequestService } from "./friend-request.service";

@Controller('friend-requests') //This is the path that will be used to access the controller
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  createRequest(@Body('from') from: string, @Body('to') to: string) {
    return this.friendRequestService.createRequest(from, to)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return err;
      });
  }
}

import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { FriendRequestService } from "../friend-request.service";
import { IFriendRequest } from "../../interfaces/IFriendRequest";
import { CreateFriendRequestDTO } from "../dto/CreateFriendRequestDTO";



describe('FriendRequestService', () => {
  let friendRequestService: FriendRequestService;
  let friendRequestModel: Model<IFriendRequest>; // Update the type with your specific model type

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendRequestService,
        {
          provide: getModelToken('FriendRequest'),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    friendRequestService = module.get<FriendRequestService>(FriendRequestService);
    friendRequestModel = module.get<Model<IFriendRequest>>(getModelToken('FriendRequest'));
  });

  describe('createRequest', () => {
    it('should throw BadRequestException if friend request already exists', async () => {
      const createFriendRequestDTO: CreateFriendRequestDTO = {
        from: 'senderId',
        to: 'recipientId',
      };

      // Mocking the findOne method to return an existing friend request
      jest.spyOn(friendRequestModel, 'findOne').mockResolvedValue(true);

      await expect(friendRequestService.createRequest(createFriendRequestDTO)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new friend request', async () => {
      const createFriendRequestDTO: CreateFriendRequestDTO = {
        from: 'senderId',
        to: 'recipientId',
      };

      // Mocking the findOne method to return null, indicating no existing friend request
      jest.spyOn(friendRequestModel, 'findOne').mockResolvedValue(null);

      // Mocking the save method to return a resolved Promise with the created friend request
      jest.spyOn(friendRequestModel.prototype, 'save').mockResolvedValue({
        _id: 'requestId',
        from: 'senderId',
        to: 'recipientId',
        sendingDate: '2023-05-15',
      });

      const result = await friendRequestService.createRequest(createFriendRequestDTO);

      expect(result).toEqual('FriendRequest with id : requestId created');
    });
  });
});

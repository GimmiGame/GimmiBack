import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGameRoomInvitation } from 'src/_interfaces/IGameRoomInvitation';
import { GameRoomInvitationRequestDTO } from './dto/GameInvitationRequestDTO';
import { GameRoomInvitationResponseDTO } from './dto/GameInvitationResponseDTO';
import { format } from 'date-fns';
import RequestStatusEnum from 'src/_enums/request-status-enum';
import { IGameRoom } from 'src/_interfaces/IGameRoom';
import { GameRoomService } from 'src/game-room/game-room.service';
import { IUser } from "../_interfaces/IUser";

@Injectable()
export class GameRoomInvitationService {

    constructor(@InjectModel('GameInvitation') private readonly gameInvitationModel: Model<IGameRoomInvitation>, private readonly gameRoomService: GameRoomService,
                @InjectModel('GameRoom') private readonly gameRoomModel: Model<IGameRoom>,
                @InjectModel('User') private readonly userModel: Model<IUser>) {}

    async createGameRoomInvitationRequest(gameRoomInvitationRequestDTO: GameRoomInvitationRequestDTO): Promise<void> {
        //get the game room
        let gameRoom;
        try {
            gameRoom = await this.gameRoomModel.findOne({roomName: gameRoomInvitationRequestDTO.roomName});
        } catch(err) {
            throw new BadRequestException('Game room does not exist');
        }

        //get users
        let fromUser;
        let toUser;
        try {
            fromUser = await this.userModel.findOne({pseudo: gameRoomInvitationRequestDTO.from});
            toUser = await this.userModel.findOne({pseudo: gameRoomInvitationRequestDTO.to});
        } catch(err) {
            throw new BadRequestException('Users do not exist');
        }

        //check if the user is already in the game room
        if(gameRoom.players.includes(toUser._id)) throw new BadRequestException('User is already in the game room');

        //check if the user is already invited
        let gameRoomInvitation;
        try {
            gameRoomInvitation = await this.gameInvitationModel.findOne({from: fromUser._id, to: toUser._id, gameRoom: gameRoom._id});
        } catch(err) {
            throw new BadRequestException('Could not check if the user is already invited');
        }

        if(gameRoomInvitation) throw new BadRequestException('User is already invited');

        //Create the invitation
        let newGameRoomInvitation;
        try {
            newGameRoomInvitation = new this.gameInvitationModel({
                from: fromUser._id,
                to: toUser._id,
                gameRoom: gameRoom._id,
                status: RequestStatusEnum.PENDING
            });
        } catch(err) {
            throw new BadRequestException('Could not create new game-room invitation.\n Details => ' + err);
        }

        let savedGameRoomInvitation;
        try {
            savedGameRoomInvitation = await newGameRoomInvitation.save();
        } catch(err) {
            throw new InternalServerErrorException('Could not save the new game-room invitation.\n Details => ' + err);
        }

    }
    //
    // async acceptRequest(_id: string): Promise<string> {
    //     let gameRoomInvitationToAccept;
    //     try {
    //         gameRoomInvitationToAccept = await this.gameInvitationModel.findById(_id);
    //         if(gameRoomInvitationToAccept.status === 'REFUSED') throw new BadRequestException('Invitation was already refused');
    //     } catch(err) {
    //         throw new BadRequestException('Game room does not exist');
    //     }
    //
    //     let updatedRequest;
    //     try {
    //         updatedRequest = await this.gameInvitationModel.updateOne(
    //           { _id: gameRoomInvitationToAccept._id },
    //           { status: RequestStatusEnum.ACCEPTED }
    //         );
    //     } catch (err) {
    //         throw new BadRequestException('Could not update friend request. Details => ' + err);
    //     }
    //
    //     let gameRoom;
    //     try {
    //         gameRoom = await this.gameRoomService.getOneById(gameRoomInvitationToAccept.gameRoomID);
    //         gameRoom.players.push(gameRoomInvitationToAccept.to);
    //     }
    //     catch(err) {
    //         throw new BadRequestException('Could not find the game room  to update after the invitation was accepted. Details => ' + err);
    //     }
    //
    //     let gameRoomUpdateRequest;
    //     try {
    //         gameRoomUpdateRequest = await this.gameRoomService.updateGameRoom(gameRoom);
    //     }
    //     catch(err) {
    //         throw new InternalServerErrorException('Could not update the game room after the invitation was accepted. Details => ' + err);
    //     }
    //
    //     return 'Game invitation with id ' + gameRoomInvitationToAccept._id + ' for the room with id : ' + gameRoomInvitationToAccept.gameRoomID + ' accepted by ' + gameRoomInvitationToAccept.to;
    // }
    //
    // async refuseRequest(_id: string): Promise<string> {
    //     let invitationRequestToDecline;
    //     try {
    //         invitationRequestToDecline = await this.gameInvitationModel.findById(_id);
    //         if(invitationRequestToDecline.status === 'ACCEPTED') throw new BadRequestException('Invitation was already accepted');
    //     } catch (err) {
    //         throw new BadRequestException('Invitation does not exist');
    //     }
    //
    //     let updatedRequest;
    //     try {
    //         updatedRequest = await this.gameInvitationModel.updateOne(
    //           { _id: invitationRequestToDecline._id },
    //           { status: RequestStatusEnum.REFUSED }
    //         );
    //     } catch (err) {
    //         throw new BadRequestException('Could not refuse invitation. Details => ' + err);
    //     }
    //     try {
    //         await this.gameInvitationModel.deleteOne({_id: _id});
    //     }
    //     catch(err) {
    //         throw new InternalServerErrorException('Could not delete invitation after it was refused. Details => ' + err);
    //     }
    //
    //     return 'Game room invitation with id : ' + invitationRequestToDecline._id + ' refused by ' + invitationRequestToDecline.to;
    // }
    //
    // async getAllPendingInvitationsRequestsForUser(to: string): Promise<IGameRoomInvitation[]> {
    //     let gameInvitationRequests;
    //     try {
    //         gameInvitationRequests = await this.gameInvitationModel.find({ to: to, status: 'PENDING'});
    //     } catch(err) {
    //         Logger.log('No game invitation requests sent to this User : ' + to + '.\n Details => ' + err);
    //     }
    //
    //     let gameInvitationsResponse : IGameRoomInvitation[] = [];
    //     if(gameInvitationRequests) {
    //         gameInvitationsResponse = gameInvitationRequests.map(gameInvitationRequests => {
    //             return {
    //                 _id: gameInvitationRequests._id,
    //                 gameRoom: gameInvitationRequests.gameRoom,
    //                 from: gameInvitationRequests.from,
    //                 to: gameInvitationRequests.to,
    //                 status: gameInvitationRequests.status
    //             };
    //         });
    //     }
    //     return gameInvitationsResponse;
    // }
    //
    // async getOneById(_id: string): Promise<IGameRoomInvitation> {
    //     let gameInvitation;
    //     try {
    //         gameInvitation = await this.gameInvitationModel.findById(_id);
    //     } catch (err) {
    //         throw new NotFoundException('No game invitation found with id : ' + _id + '.\n Details => ' + err);
    //     }
    //
    //     let response: IGameRoomInvitation;
    //
    //     if (gameInvitation) {
    //         response = {
    //             _id: _id,
    //             gameRoom: gameInvitation.gameRoom,
    //             from: gameInvitation.from,
    //             to: gameInvitation.to,
    //             status: gameInvitation.status
    //         };
    //     }
    //     return response;
    // }
    //
    async findAllGameInvitations(): Promise<IGameRoomInvitation[]> {
        let gameInvitationsList : IGameRoomInvitation[] = [];
        try {
            gameInvitationsList = await this.gameInvitationModel.find()
              .populate({
                  path : 'gameRoom',
                  select : 'roomName _id'
              })
              .populate({
                  path : 'from',
                  select : 'pseudo'
              })
              .populate({
                  path : 'to',
                  select : 'pseudo'
              })
        } catch(err) {
            Logger.log('No game invitations found.\n Details => ' + err);
        }

        return gameInvitationsList;
    }



}

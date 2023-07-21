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


    async findAllGameInvitations(): Promise<IGameRoomInvitation[]> {
        let gameInvitationsList : IGameRoomInvitation[] = [];
        try {
            gameInvitationsList = await this.gameInvitationModel.find()
              .populate({
                  path : 'gameRoom',
                  select : 'roomName'
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

    async getOneById(_id: string): Promise<IGameRoomInvitation> {
        let gameInvitation;
        try {
            gameInvitation = await this.gameInvitationModel.findById(_id)
              .populate({
                  path : 'gameRoom',
                  select : 'roomName'
              })
              .populate({
                  path : 'from',
                  select : 'pseudo'
              })
              .populate({
                  path : 'to',
                  select : 'pseudo'
              });
        } catch (err) {
            throw new BadRequestException('No game invitation found with id : ' + _id);
        }

        return gameInvitation;
    }

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

        if(gameRoomInvitation) {
            try{
                await this.updateExistingRequest(gameRoomInvitation);
            }catch(err) {
                throw new InternalServerErrorException('Could not update existing request. Details => ' + err);
            }
        }else{
            //Doesn't exist so create the invitation
            try{
                await this.gameInvitationModel.create({
                    from: fromUser._id,
                    to: toUser._id,
                    gameRoom: gameRoom._id,
                })
            }catch(err) {
                throw new InternalServerErrorException('Could not create the invitation. Details => ' + err);
            }
        }
    }


    async acceptRequest(_id: string): Promise<void> {
        //Get the invitation
        let invitationRequestToAccept;
        try {
            invitationRequestToAccept = await this.gameInvitationModel.findById(_id);
            if(invitationRequestToAccept.status === 'ACCEPTED') throw new BadRequestException('Invitation was already accepted');
        } catch (err) {
            throw new BadRequestException('Invitation does not exist');
        }

        if(!invitationRequestToAccept) throw new BadRequestException('Invitation does not exist');

        //Get the game room
        let gameRoom;
        try {
            gameRoom = await this.gameRoomModel.findById(invitationRequestToAccept.gameRoom);
        } catch(err) {
            throw new BadRequestException('Game room does not exist');
        }

        //Get the users
        let fromUser;
        let toUser;
        try {
            fromUser = await this.userModel.findById(invitationRequestToAccept.from);
            toUser = await this.userModel.findById(invitationRequestToAccept.to);
        } catch(err) {
            throw new BadRequestException('Users do not exist');
        }

        //Check if the user is already in the game room
        if(gameRoom.players.includes(toUser._id)) throw new BadRequestException('User is already in the game room');

        //Add user to the game room
        try {
            await this.gameRoomService.joinGameRoom(gameRoom.roomName, toUser._id);
        } catch(err) {
            throw new InternalServerErrorException('Could not add user to the game room. Details => ' + err);
        }

        //Update the invitation status
        try {
            await this.gameInvitationModel.updateOne(
                { _id: invitationRequestToAccept._id },
                { status: RequestStatusEnum.ACCEPTED }
            );
        } catch (err) {
            throw new BadRequestException('Could not accept invitation. Details => ' + err);
        }

    }

    async deleteOne(_id: string): Promise<void> {
        //Delete the invitation
        try {
            await this.gameInvitationModel.deleteOne({_id: _id});
        } catch(err) {
            throw new BadRequestException('Could not delete invitation. Details => ' + err);
        }
    }

    async
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


    //PRIVATE METHODS//
    private async updateExistingRequest(invitationRequestToAccept: IGameRoomInvitation): Promise<void> {
        switch (invitationRequestToAccept.status) {
            case RequestStatusEnum.PENDING:
                throw new BadRequestException('Invitation is still pending');
            default:
                try{
                    await this.gameInvitationModel.updateOne(
                      { _id: invitationRequestToAccept._id },
                      { status: RequestStatusEnum.PENDING }
                    );
                }catch (err) {
                    throw new BadRequestException('Could not update invitation. Details => ' + err);
                }
                break ;
        }
    }


}

import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGameInvitation } from 'src/_interfaces/IGameInvitation';
import { GameRoomInvitationRequestDTO } from './dto/GameInvitationRequestDTO';
import { GameRoomInvitationResponseDTO } from './dto/GameInvitationResponseDTO';
import { format } from 'date-fns';
import RequestStatusEnum from 'src/_enums/request-status-enum';
import { IGameRoom } from 'src/_interfaces/IGameRoom';
import { GameRoomService } from 'src/game-room/game-room.service';

@Injectable()
export class GameInvitationService {

    constructor(@InjectModel('GameInvitationRequest') private readonly gameInvitationModel: Model<IGameInvitation>, private readonly gameRoomService: GameRoomService) {}
    
    async createGameRoomInvitationRequest(gameRoomInvitationRequestDTO: GameRoomInvitationRequestDTO): Promise<GameRoomInvitationResponseDTO> {
        let existingGameInvitationRequest;
        try {
            existingGameInvitationRequest = await this.gameInvitationModel.findOne({
                from: gameRoomInvitationRequestDTO.from,
                to: gameRoomInvitationRequestDTO.to
            });
        } catch(err) {
            Logger.log('No game invitation found : ' + err + "\nCreating new one ...")
        }

        if(existingGameInvitationRequest) {
            throw new BadRequestException('Game invitation already sent');
        }

        let newInvitationRequest;
        let cuurrentDate = new Date();
        let formattedDate = format(cuurrentDate, 'yyyy-MM-dd');
        try {
            newInvitationRequest = new this.gameInvitationModel({
                ...gameRoomInvitationRequestDTO,
                sendingDate: formattedDate,

            });
        } catch (err) {
            throw new BadRequestException('Could not send game room invitation request.\n Details => ' + err);
        }

        let savedRequest;
        try {
            savedRequest = await newInvitationRequest.save()
        } catch(err) {
            throw new BadRequestException('Could not save game room invitation request.\n Details => ' + err);
        }

        let createdRequest: GameRoomInvitationResponseDTO = {
            roomInvitationID: savedRequest._id,
            message: 'Game invitation send with id : ' + savedRequest._id + ' from ' + newInvitationRequest.from + ' to ' + newInvitationRequest.to + ' for the room with id : ' + newInvitationRequest.gameRoomID,
        }
        return createdRequest;
    }

    async acceptRequest(_id: string): Promise<string> {
        let gameRoomInvitationToAccept;
        try {
            gameRoomInvitationToAccept = await this.gameInvitationModel.findById(_id);
            if(gameRoomInvitationToAccept.status === 'REFUSED') throw new BadRequestException('Invitation was already refused');           
        } catch(err) {
            throw new BadRequestException('Game room does not exist');
        }

        let updatedRequest;
        try {
            updatedRequest = await this.gameInvitationModel.updateOne(
              { _id: gameRoomInvitationToAccept._id },
              { status: RequestStatusEnum.ACCEPTED }
            );
        } catch (err) {
            throw new BadRequestException('Could not update friend request. Details => ' + err);
        }

        let gameRoom;
        try {
            gameRoom = await this.gameRoomService.getOneById(gameRoomInvitationToAccept.gameRoomID);
            gameRoom.players.push(gameRoomInvitationToAccept.to);
        }
        catch(err) {
            throw new BadRequestException('Could not find the game room  to update after the invitation was accepted. Details => ' + err);
        }

        let gameRoomUpdateRequest;
        try {
            gameRoomUpdateRequest = await this.gameRoomService.updateGameRoom(gameRoom);
        }
        catch(err) {
            throw new InternalServerErrorException('Could not update the game room after the invitation was accepted. Details => ' + err);
        }

        return 'Game invitation with id ' + gameRoomInvitationToAccept._id + ' for the room with id : ' + gameRoomInvitationToAccept.gameRoomID + ' accepted by ' + gameRoomInvitationToAccept.to;
    }

    async refuseRequest(_id: string): Promise<string> {
        let invitationRequestToDecline;
        try {
            invitationRequestToDecline = await this.gameInvitationModel.findById(_id);
            if(invitationRequestToDecline.status === 'ACCEPTED') throw new BadRequestException('Invitation was already accepted');
        } catch (err) {
            throw new BadRequestException('Invitation does not exist');
        }

        let updatedRequest;
        try {
            updatedRequest = await this.gameInvitationModel.updateOne(
              { _id: invitationRequestToDecline._id },
              { status: RequestStatusEnum.REFUSED }
            );
        } catch (err) {
            throw new BadRequestException('Could not refuse invitation. Details => ' + err);
        }
        try {
            await this.gameInvitationModel.deleteOne({_id: _id});
        }
        catch(err) {
            throw new InternalServerErrorException('Could not delete invitation after it was refused. Details => ' + err);
        }

        return 'Game room invitation with id : ' + invitationRequestToDecline._id + ' refused by ' + invitationRequestToDecline.to;
    }

    async getAllPendingInvitationsRequestsForUser(to: string): Promise<IGameInvitation[]> {
        let gameInvitationRequests;
        try {
            gameInvitationRequests = await this.gameInvitationModel.find({ to: to, status: 'PENDING'});
        } catch(err) {
            Logger.log('No game invitation requests sent to this User : ' + to + '.\n Details => ' + err);
        }

        let gameInvitationsResponse : IGameInvitation[] = [];
        if(gameInvitationRequests) {
            gameInvitationsResponse = gameInvitationRequests.map(gameInvitationRequests => {
                return {
                    _id: gameInvitationRequests._id,
                    gameRoomID: gameInvitationRequests.gameRoomID,
                    from: gameInvitationRequests.from,
                    to: gameInvitationRequests.to,
                    sendingDate: gameInvitationRequests.sendingDate,
                    status: gameInvitationRequests.status
                };
            });
        }
        return gameInvitationsResponse;
    }

    async getOneById(_id: string): Promise<IGameInvitation> {
        let gameInvitation;
        try {
            gameInvitation = await this.gameInvitationModel.findById(_id);
        } catch (err) {
            throw new NotFoundException('No game invitation found with id : ' + _id + '.\n Details => ' + err);
        }

        let response: IGameInvitation;

        if (gameInvitation) {
            response = {
                _id: _id,
                gameRoomID: gameInvitation.gameRoomID,
                from: gameInvitation.from,
                to: gameInvitation.to,
                sendingDate: gameInvitation.sendingDate,
                status: gameInvitation.status
            };
        }
        return response;
    }

    async findAllGameInvitations(): Promise<string[]> {
        let gameInvitationsList : string[] = [];
        try {
            gameInvitationsList = await this.gameInvitationModel.find();
        } catch(err) {
            Logger.log('No game invitations found.\n Details => ' + err);
        }
        return gameInvitationsList;
    }



}

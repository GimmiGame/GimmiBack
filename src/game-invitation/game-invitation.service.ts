import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGameInvitation } from 'src/interfaces/IGameInvitation';
import { GameRoomInvitationRequestDTO } from './dto/GameInvitationRequestDTO';
import { GameRoomInvitationResponseDTO } from './dto/GameInvitationResponseDTO';
import { format } from 'date-fns';
import RequestStatusEnum from 'src/enums/request-status-enum';

@Injectable()
export class GameInvitationService {

    constructor(@InjectModel('GameInvitationRequest') private readonly gameInvitationModel: Model<IGameInvitation>) {}
    
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
            gameRoomID: savedRequest._id,
            message: 'Game invitation send with id : ' + savedRequest._id + ' from ' + newInvitationRequest.from + ' to ' + newInvitationRequest.to,
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

        return 'Game invitation for the room with id : ' + gameRoomInvitationToAccept._id + ' accepted by ' + gameRoomInvitationToAccept.to;
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


}

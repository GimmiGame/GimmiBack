import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameRoomInvitationService } from './game-room-invitation.service';
import { GameRoomInvitationRequestDTO } from './dto/GameInvitationRequestDTO';
import { GameRoomInvitationResponseDTO } from './dto/GameInvitationResponseDTO';
import { IFriendRequest } from 'src/_interfaces/IFriendRequest';
import { IGameRoomInvitation } from 'src/_interfaces/IGameRoomInvitation';

@Controller('game-room-invitations')
@ApiTags('Game room Invitation')
export class GameRoomInvitationController {

    constructor(private readonly gameInvitationService: GameRoomInvitationService) {}

    // @Get('invitations/:username')
    // @ApiOperation({
    //     description: 'Get all pending invitations of a user',
    // })
    // @ApiParam({
    //     name: 'username',
    //     description: 'The pseudo of the user to see all pending invitations. Return empty array if no invitation requests are found.',
    //     schema: {
    //         default: 'test3',
    //     }
    // })
    // @ApiResponse({
    //     status: 200,
    //     description: 'The invitation requests have been successfully retrieved.',
    // })
    // async getAllPendingInvitationsForThisUser(@Param('username') to: string) : Promise<IGameRoomInvitation[]>{
    //     try {
    //         return await this.gameInvitationService.getAllPendingInvitationsRequestsForUser(to);
    //     } catch (err) {
    //         throw new NotFoundException('Could not get invitation requests of this user. Error: ' + err.message);
    //     }
    // }
    //
    @Get('all')
    @ApiOperation({
        description: 'Find all game invitations.',
    })
    async findAllGameInvitations() : Promise<IGameRoomInvitation[]> {
        try {
            return await this.gameInvitationService.findAllGameInvitations();
        } catch(err) {
            throw new NotFoundException('No game invitations found. Error: ' + err.message);
        }
    }
    @Get('id/:_id')
    @ApiOperation({
        description: 'Get the game invitation by its id.',
    })
    @ApiParam({
        name: '_id',
        schema: {
            default: '64725edd894e72824610e304',
        }
    })
    async getGameRoomById(@Param('_id') _id: string ) : Promise<IGameRoomInvitation> {
        try {
            return await this.gameInvitationService.getOneById(_id);
        } catch(err) {
            throw new NotFoundException('Could not get invitation request. Error: ' + err.message);
        }
    }


    @Post('create')
    @ApiOperation({
        description: 'Create a new game invitation request.',
    })
    @ApiBody({
        type: GameRoomInvitationRequestDTO
    })
    @ApiResponse({
        status: 201,
        description: 'The friend request has been successfully created.',
    })
    async createRequest(@Body() gameRoomInvitationRequestDTO: GameRoomInvitationRequestDTO): Promise<void> {
        try {
            return await this.gameInvitationService.createGameRoomInvitationRequest(gameRoomInvitationRequestDTO);
        }
        catch(err) {
            throw new BadRequestException('Could not create game invitation request. Error: ' + err.message);
        }
    }

    @Patch('accept/:_id')
    @ApiOperation({
        description: 'Accept a friend request',
    })
    @ApiParam({
        name: '_id',
        schema: {
            default: '647265195dc8155d951d3a9c',
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The invitation has been successfully accepted.',
    })
    async acceptRequest(@Param('_id') _id: string) : Promise<void>{
        try {
        return await this.gameInvitationService.acceptRequest(_id);
        } catch (err) {
            throw new NotFoundException('Could not accept invitation request. Error: ' + err.message);
        }
    }

    @Patch('refuse/:_id')
    @ApiOperation({
        description: 'Refuse a game room invitation by giving the its _id',
    })
    @ApiParam({
        name: '_id',
        schema: {
            default: '647265195dc8155d951d3a9c',
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The invitation has been successfully refused.',
    })
    async refuseRequest(@Param('_id') _id: string) : Promise<void>{
        try {
        return await this.gameInvitationService.deleteOne(_id);
        } catch (err) {
            throw new NotFoundException('Could not reject invitation. Error: ' + err.message);
        }
    }

    @Delete('delete/:_id')
    @ApiOperation({
        description: 'Delete a game invitation request by giving its _id',
    })
    @ApiParam({
        name: '_id',
        schema: {
            default: '647265195dc8155d951d3a9c',
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The invitation has been successfully deleted.',
    })
    async deleteRequest(@Param('_id') _id: string) : Promise<void>{
        try {
        return await this.gameInvitationService.deleteOne(_id);
        } catch (err) {
            throw new NotFoundException('Could not delete invitation. Error: ' + err.message);
        }
    }

}

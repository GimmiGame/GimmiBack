import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameInvitationService } from './game-invitation.service';
import { GameRoomInvitationRequestDTO } from './dto/GameInvitationRequestDTO';
import { GameRoomInvitationResponseDTO } from './dto/GameInvitationResponseDTO';
import { IFriendRequest } from 'src/interfaces/IFriendRequest';
import { IGameInvitation } from 'src/interfaces/IGameInvitation';

@Controller('game-invitations')
@ApiTags('Game Invitation ')
export class GameInvitationController {

    constructor(private readonly gameInvitationService: GameInvitationService) {}

    @Get('invitations/:username')
    @ApiOperation({
        description: 'Get all pending invitations of a user',
    })
    @ApiParam({
        name: 'username',
        description: 'The pseudo of the user to see all pending invitations. Return empty array if no invitation requests are found.',
        schema: {
            default: 'test3',
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The invitation requests have been successfully retrieved.',
    })
    async getAllPendingInvitationsForThisUser(@Param('username') to: string) : Promise<IGameInvitation[]>{
        try {
            return await this.gameInvitationService.getAllPendingInvitationsRequestsForUser(to);
        } catch (err) {
            throw new NotFoundException('Could not get invitation requests of this user. Error: ' + err.message);
        }
    }

    @Get('id/:_id')
    @ApiOperation({
        description: 'Get the game invitation by its id. Return 404 if no game invitation is found.',
    })
    @ApiParam({
        name: '_id',
        schema: {
        default: '64725edd894e72824610e304',
        }
    })
    async getGameRoomById(@Param('_id') _id: string ) : Promise<IGameInvitation> {
        try {
            return await this.gameInvitationService.getOneById(_id);
        } catch(err) {
            throw new NotFoundException('Could not get invitation request. Error: ' + err.message);
        }
    }

    @Get('findAll')
    @ApiOperation({
        description: 'Find all game invitations.',
    })
    async findAllGameInvitations() : Promise<string[]> {
        try {
            return await this.gameInvitationService.findAllGameInvitations();
        } catch(err) {
            throw new NotFoundException('No game invitations found. Error: ' + err.message);
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
        type: GameRoomInvitationResponseDTO
    })  
    async createRequest(@Body() gameRoomInvitationRequestDTO: GameRoomInvitationRequestDTO): Promise<GameRoomInvitationResponseDTO> {
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
    async acceptRequest(@Param('_id') _id: string) : Promise<string>{
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
    async refuseRequest(@Param('_id') _id: string) : Promise<string>{
        try {
        return await this.gameInvitationService.refuseRequest(_id);
        } catch (err) {
            throw new NotFoundException('Could not reject invitation. Error: ' + err.message);
        }
    }
    
}

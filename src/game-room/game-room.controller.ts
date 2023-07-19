import { BadRequestException, Body, Controller, NotFoundException, Param, Patch, Post, Get, Query, Delete } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameRoomService } from './game-room.service';
import { CreateGameRoomRequestDTO } from './dto/request/CreateGameRoomRequestDTO';
import { IGameRoomInvitation } from 'src/_interfaces/IGameRoomInvitation';
import { IGameRoom } from 'src/_interfaces/IGameRoom';

@Controller('game-rooms')
@ApiTags('GameRoom')
export class GameRoomController {
    constructor(private readonly gameRoomService: GameRoomService) {}

    @Get('all')
    @ApiOperation({
        description: 'Find all game rooms.',
    })
    async getAllGameRooms() : Promise<IGameRoom[]> {
        try {
            return await this.gameRoomService.findAllGameRooms();
        } catch(err) {
            throw new NotFoundException('No game rooms found. Error: ' + err.message);
        }
    }

    @Get('id/:_id')
    @ApiOperation({
        description: 'Get the game room by its id.',
    })
    @ApiParam({
        name: '_id',
        schema: {
        default: '6471294f74ae51832b3483e5',
        }
    })
    async getGameRoomById(@Param('_id') _id: string ) : Promise<IGameRoom> {
        try {
            return await this.gameRoomService.getOneById(_id);
        } catch(err) {
            throw new NotFoundException('Could not get game room. Error: ' + err.message);
        }
    }

    @Post('create')
    @ApiOperation({
        description: 'Create a new game room.',
    })
    @ApiBody({
        type: CreateGameRoomRequestDTO
    })
    @ApiResponse({
        status: 201,
        description: 'The game room has been successfully created.',
    })
    async createGameRoom(@Body() createGameRoomRequest: CreateGameRoomRequestDTO) : Promise<void> {
        try {
            return await this.gameRoomService.createGameRoom(createGameRoomRequest)
        } catch(err) {
            throw new BadRequestException('Could not create new game room. Error: ' + err.message);
        }
    }

    @Patch('join')
    @ApiOperation({
        description: 'Join a game room.',
    })
    @ApiQuery({
        name: 'roomName',
        description: 'The name of the game room to join.',
        schema: {
            default: 'bestRoomEver'
        }
    })
    @ApiQuery({
        name: 'userId',
        description: 'The id of the user who wants to join the game room.',
        schema: {
            default: '123456_userId_456'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'User succesfully joined the game room.',
    })
    async joinGameRoom(@Query('roomName') roomName : string, @Query('userId') userId: string) : Promise<void> {
        try {
            return await this.gameRoomService.joinGameRoom(roomName,userId);
        } catch(err) {
            throw new NotFoundException('Could not join the game room. Error: ' + err.message);
        }
    }

    @Patch('exit')
    @ApiOperation({
        description: 'Exit a game room.',
    })
    @ApiQuery({
        name: 'roomName',
        schema: {
            default: 'bestRoomEver'
        }
    })
    @ApiQuery({
        name: 'userId',
        schema: {
            default: '123456_userId_456'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'User succesfully exited the game room.',
    })
    async exitGameRoom(@Query('roomName') roomName : string, @Query('userId') userId: string) : Promise<void> {
        try {
            return await this.gameRoomService.exitGameRoom(roomName,userId);
        } catch(err) {
            throw new BadRequestException('Something went wrong. Error: ' + err.message);
        }
    }

    @Patch('update/:roomName')
    @ApiOperation({
        description: 'Update a game room by its name',
    })
    @ApiParam({
        name: 'roomName',
        schema: {
            default: 'bestRoomEver',
        }
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                roomName: {
                    type: 'string',
                    default: 'bestRoomEver'
                },
                currentGame: {
                    type: 'string',
                },
                players: {
                    type: 'array',
                },
                maxPlayers: {
                    type: 'number',
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The game room has been successfully updated.',
    })
    async updateGameRoom(@Param('roomName') roomName: string, @Body() data: IGameRoom) : Promise<void>{
        try {
            return await this.gameRoomService.updateGameRoom(roomName, data);
        } catch (err) {
            throw new NotFoundException('Could not update friend request. Error: ' + err.message);
        }
    }

    @Delete('delete/:roomName')
    @ApiOperation({
        description: 'Delete a game room by its name',
    })
    @ApiParam({
        name: 'roomName',
        schema: {
        default: 'bestRoomEver',
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The game room has been successfully deleted.',
    })
    async deleteGameRoom(@Param('roomName') roomName: string) : Promise<void>{
        try {
        return await this.gameRoomService.deleteGameRoom(roomName);
        } catch (err) {
            throw new NotFoundException('Could not delete friend request. Error: ' + err.message);
        }
    }


}

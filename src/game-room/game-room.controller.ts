import { BadRequestException, Body, Controller, NotFoundException, Param, Patch, Post, Get, Query, Delete } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameRoomService } from './game-room.service';
import { CreateGameRoomRequestDTO } from './dto/request/CreateGameRoomRequestDTO';
import { CreateGameRoomResponseDTO } from './dto/response/CreateGameRoomResponseDTO';
import { IGameInvitation } from 'src/interfaces/IGameInvitation';
import { IGameRoom } from 'src/interfaces/IGameRoom';

@Controller('game-rooms')
@ApiTags('GameRoom')
export class GameRoomController {
    constructor(private readonly gameRoomService: GameRoomService) {}

    @Get('findAll')
    @ApiOperation({
        description: 'Find all game rooms.',
    })
    async findAllGameRooms() : Promise<string[]> {
        try {
            return await this.gameRoomService.findAllGameRooms();
        } catch(err) {
            throw new NotFoundException('No game rooms found. Error: ' + err.message);
        }
    }

    @Get('id/:_id')
    @ApiOperation({
        description: 'Get the game room by its id. Return 404 if no game room request is found.',
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
            throw new NotFoundException('Could not get invitation request. Error: ' + err.message);
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
        type: CreateGameRoomResponseDTO
    })
    async createGameRoom(@Body() createGameRoomRequest: CreateGameRoomRequestDTO) : Promise<CreateGameRoomResponseDTO > {
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
        name: 'id',
        schema: {
            default: '6471294f74ae51832b3483e5'
        }
    })
    @ApiQuery({
        name: 'pseudo',
        schema: {
            default: 'testPseudo'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'You succesfully joined the game room.',
    })
    async joinGameRoom(@Query('id') id : string, @Query('pseudo') pseudo: string) : Promise<string[]> {
        try {
            return await this.gameRoomService.joinGameRoom(id,pseudo);
        } catch(err) {
            throw new NotFoundException('Could not join the game room. Error: ' + err.message);
        }
    }

    @Patch('exit')
    @ApiOperation({
        description: 'Exit a game room.',
    })
    @ApiQuery({
        name: 'id',
        schema: {
            default: '6471294f74ae51832b3483e5'
        }
    })
    @ApiQuery({
        name: 'pseudo',
        schema: {
            default: 'testPseudo'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'You succesfully exited the game room.',
    })
    async exitGameRoom(@Query('id') id : string, @Query('pseudo') pseudo: string) : Promise<string[]> {
        try {
            return await this.gameRoomService.exitGameRoom(id,pseudo);
        } catch(err) {
            throw new BadRequestException('Something went wrong. Error: ' + err.message);
        }
    }

    @Delete('delete/:_id')
    @ApiOperation({
        description: 'Delete a game room by its _id',
    })
    async deleteGameRoom(@Param('_id') _id: string) : Promise<string>{
        try {
        return await this.gameRoomService.deleteGameRoom(_id);
        } catch (err) {
            throw new NotFoundException('Could not delete friend request. Error: ' + err.message);
        }
    }
}

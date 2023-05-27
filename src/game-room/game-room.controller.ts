import { BadRequestException, Body, Controller, NotFoundException, Param, Patch, Post, Get, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameRoomService } from './game-room.service';
import { CreateGameRoomRequestDTO } from './dto/request/CreateGameRoomRequestDTO';
import { CreateGameRoomResponseDTO } from './dto/response/CreateGameRoomResponseDTO';

@Controller('game-room')
@ApiTags('GameRoom')
export class GameRoomController {
    constructor(private readonly gameRoomService: GameRoomService) {}

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
}

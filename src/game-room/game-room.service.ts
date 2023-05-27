import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGameRoom } from 'src/interfaces/IGameRoom';
import { CreateGameRoomRequestDTO } from './dto/request/CreateGameRoomRequestDTO';
import { CreateGameRoomResponseDTO } from './dto/response/CreateGameRoomResponseDTO';


@Injectable()
export class GameRoomService {

    constructor(@InjectModel('GameRoom') private readonly gameRoomModel: Model<IGameRoom> ) {}
    
    async createGameRoom(createGameRoomRequestDTO: CreateGameRoomRequestDTO): Promise<CreateGameRoomResponseDTO> {
        let newRequest;
        try {
            newRequest = new this.gameRoomModel({
                ...createGameRoomRequestDTO,
            });
        } catch(err) {
            throw new BadRequestException('Could not create new game-room.\n Details => ' + err);
        }

        let savedRequest; 
        try {
            savedRequest = await newRequest.save()
        } catch (err) {
            throw new BadRequestException('Could not save new game-room.\n Details => ' + err);
        }

        let createdRequest : CreateGameRoomResponseDTO = {
            _id: savedRequest._id,
            message: 'GameRoom - ' + savedRequest.roomName + ' with id : ' + savedRequest._id + ' created.'
        }
        return createdRequest;
    }

    async joinGameRoom(_id: string, pseudo: string) : Promise<string[]> {
        let gameRoom;
        try {
            gameRoom = await this.gameRoomModel.findOne({ _id: _id});
        } catch(err) {
            throw new BadRequestException('This room does not exist');
        }

        if(gameRoom) {
            if(gameRoom.players.includes(pseudo)) {
                throw new BadRequestException('You are already in this room');
            }
            gameRoom.players.push(pseudo);
            gameRoom.save()
        }
        return gameRoom.players
    }

    async findAllGameRooms(): Promise<string[]> {
        let gameRoomsList : string[] = [];
        try {
            gameRoomsList = await this.gameRoomModel.find();
        } catch(err) {
            Logger.log('No game rooms found.\n Details => ' + err);
        }
        return gameRoomsList;
    }

    async exitGameRoom(_id: string, pseudo: string): Promise<string[]> {
        let gameRoom;
        try {
            gameRoom = await this.gameRoomModel.findOne({ _id: _id});
        } catch(err) {
            throw new BadRequestException('This room does not exist');
        }

        if(gameRoom) {
            const index = gameRoom.players.indexOf(pseudo, 0);
            if (index > -1) {
                gameRoom.players.splice(index, 1);
            }
            gameRoom.save()
        }
        return gameRoom.players
    }

    async deleteGameRoom(_id: string): Promise<string> {
        let result;
        try {
            result = await this.gameRoomModel.deleteOne({ _id: _id });
        } catch (err) {
            throw new NotFoundException('No game room found with id : ' + _id + '. Details => ' + err);
        }

        return 'Game room with id : ' + _id + ' deleted';
    }

    async getOneById(_id: string): Promise<IGameRoom> {
        let gameRoom;
        try {
            gameRoom = await this.gameRoomModel.findById(_id);
        } catch (err) {
            throw new NotFoundException('No game room found with id : ' + _id + '.\n Details => ' + err);
        }

        let response: IGameRoom;

        if (gameRoom) {
            response = {
                _id: gameRoom._id,
                roomName: gameRoom.roomName,
                game: gameRoom.game,
                players: gameRoom.players,
                creator: gameRoom.creator,
                gameStarted: gameRoom.gameStarted,
                gameTerminated: gameRoom.gameTerminated,
                gameSaved: gameRoom.gameSaved,
            };
        }

        return response;
    }

}

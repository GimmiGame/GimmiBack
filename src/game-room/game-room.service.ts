import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGameRoom } from 'src/_interfaces/IGameRoom';
import { CreateGameRoomRequestDTO } from './dto/request/CreateGameRoomRequestDTO';
import { omit } from 'lodash';
import { CreateGameRoomResponseDTO } from './dto/response/CreateGameRoomResponseDTO';
import { UserService } from "../user/user.service";


@Injectable()
export class GameRoomService {

    constructor(@InjectModel('GameRoom') private readonly gameRoomModel: Model<IGameRoom> , private readonly userService : UserService) {}
    
    async createGameRoom(createGameRoomRequestDTO: CreateGameRoomRequestDTO): Promise<void> {
        const userObject = await this.userService.getUserByPseudo(createGameRoomRequestDTO.creator);
        let newRequest
        try {
            await this.gameRoomModel.create({
                roomName: createGameRoomRequestDTO.roomName,
                currentGame: createGameRoomRequestDTO.currentGame,
                creator: userObject._id,
                maxPlayers: createGameRoomRequestDTO.maxPlayers,
            });
        } catch(err) {
            throw new BadRequestException('Impossible de créer/enregistrer la nouvelle salle de jeu.\n Détails => ' + err);
        }

        //ADD CREATOR TO PLAYERS LIST
        try {
            await this.gameRoomModel.findOneAndUpdate(
                { roomName: createGameRoomRequestDTO.roomName },
                { $push: { players: userObject._id } },
                { new: true }
            );
        } catch(err) {
            throw new BadRequestException('Impossible d\'ajouter le créateur à la liste des joueurs.\n Détails => ' + err);
        }

    }

    async findAllGameRooms(): Promise<IGameRoom[]> {
        let gameRoomsList : IGameRoom[] = [];
        try {
            gameRoomsList = await this.gameRoomModel.find()
              .populate({
                  path : 'creator',
                  select: 'pseudo'
              })
              .populate({
                  path : 'players',
                  select: 'pseudo'
              });
        } catch(err) {
            Logger.log('No game rooms found.\n Details => ' + err);
        }


        return gameRoomsList;
    }

    async joinGameRoom(roomName: string, userId: string) : Promise<void> {
        let gameRoom;
        try {
            gameRoom = await this.gameRoomModel.findOne({ roomName: roomName});
        } catch(err) {
            throw new BadRequestException('This room does not exist');
        }

        if(gameRoom) {
            if(gameRoom.players.includes(userId)) {
                throw new BadRequestException('User is already in this room');
            }
        }

        try{
            gameRoom.players.push(userId);
            gameRoom.save()
        } catch(err) {
            throw new BadRequestException('Could not add the player to the game-room.\n Details => ' + err);
        }

    }

    async exitGameRoom(roomName: string, userId: string): Promise<void> {
        try {
            const updatedGameRoom = await this.gameRoomModel.findOneAndUpdate(
              { roomName: roomName, players: userId },
              { $pull: { players: userId } },
              { new: true }
            );

            if (!updatedGameRoom) {
                throw new BadRequestException('User is not in this room');
            }

            if (updatedGameRoom.players.length === 0) {
                await this.gameRoomModel.deleteOne({ roomName: roomName });
            }
        } catch (err) {
            throw new BadRequestException('Could not remove the player from the game-room.\n Details => ' + err);
        }
    }



    async getOneById(_id: string): Promise<IGameRoom> {
        let gameRoom : IGameRoom
        try {
            gameRoom = await this.gameRoomModel.findById(_id)
              .populate({
                  path : 'creator',
                  select: 'pseudo'
              })
              .populate({
                  path : 'players',
                  select: 'pseudo'
              });

        } catch (err) {
            throw new NotFoundException('No game room found with id : ' + _id + '.\n Details => ' + err);
        }

        return gameRoom;
    }

    async updateGameRoom(roomName: string, updateData: Partial<IGameRoom>): Promise<void> {
        try {
            const updatedGameRoom = await this.gameRoomModel.findOneAndUpdate(
              { roomName: roomName },
              { $set: updateData },
              { new: true }
            );

            if (!updatedGameRoom) {
                throw new NotFoundException('No game room found with name : ' + roomName);
            }

        } catch (err) {
            throw new BadRequestException('Could not update game room. Details => ' + err);
        }
    }

    async deleteGameRoom(roomName: string): Promise<void> {
        try {
            await this.gameRoomModel.deleteOne({ roomName: roomName });
        } catch (err) {
            throw new NotFoundException('No game room found with name : ' + roomName + ' to delete. Details => ' + err);
        }
    }


}

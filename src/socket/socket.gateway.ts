import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway, WebSocketServer
} from "@nestjs/websockets";
import { ChildProcess, spawn } from "child_process";
import * as path from 'path';
import { Server } from "socket.io";
import { MorpionScriptService } from "../morpion_script/morpion_script.service";


@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  inRoomPlayers: string[] = []
  inGameSessionPlayers: string[] = []
  gameIsRunning: boolean = false
  morpionScriptPath = 'src/morpion.py'
  pythonProcess: ChildProcess

  MAX_PLAYER_MORPION = 2
  userOne = {
    clientId : "",
    pseudo : ""
  }
  turn = "" //player pseudo who has to play
  dataFromClient = {init: {players: 2}}


  @WebSocketServer() server: Server

  afterInit(server: any) {
    console.log('init');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    this.inRoomPlayers.push(client.id)

  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
    this.inRoomPlayers = this.inRoomPlayers.filter(player => player !== client.id)
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: any, payload: any) {
    console.log("Message received : ", payload)
    this.server.emit('receivedMessage', payload)
  }

  @SubscribeMessage('connectGame')
    handleConnectGame(client: any, pseudo : string){
    console.log("User connected to game : ", pseudo)
    this.inGameSessionPlayers.push(pseudo)
    this.server.emit('gameConnectedUsers', this.inGameSessionPlayers)
  }

  @SubscribeMessage('disconnectGame')
    handleDisconnectGame(client: any, pseudo : string){
    console.log("User disconnected from game : ", pseudo)
    this.inGameSessionPlayers = this.inGameSessionPlayers.filter(player => player !== pseudo)
    this.server.emit('gameConnectedUsers', this.inGameSessionPlayers)
  }

  @SubscribeMessage('startGame')
    handleStartGame(client: any, pseudo : string){
    console.log("User started game : ", pseudo)
    if(this.inGameSessionPlayers.length < this.MAX_PLAYER_MORPION){
      console.log("Not enough players")
      return
    }

    //Start
    this.pythonProcess = spawn('python', [this.morpionScriptPath]);
    this.pythonProcess.stdout.setMaxListeners(25)
    this.userOne = {
      clientId : client.id,
      pseudo : pseudo
    }
    this.turn = pseudo
    this.initGame()
    console.log("Game started")
  }

  @SubscribeMessage('sendCase')
    handleSendCase(client: any, dataClient){
    console.log("Data from client : ", dataClient)
    if(this.gameIsRunning){
      this.executeGameAction(dataClient)
    }
  }

  @SubscribeMessage('gameDataToServer')
    handleGameDataToServer(client: any, dataClient){
    console.log("Data from client : ", dataClient)
    if(this.gameIsRunning){
      this.executeGameAction(dataClient)
    }
  }

  initGame(){
    let test
    this.pythonProcess.stdin.write(JSON.stringify(this.dataFromClient) + '\n');
    console.log("Data sent to python : ", JSON.stringify(this.dataFromClient))
    this.pythonProcess.stdout.on('data', data => {
      console.log("Data from python : ", data.toString())
      const gameData ={
        dataFromPython: JSON.parse(data.toString()),
        turn: this.turn
      }
      this.server.emit('gameDataToClient', gameData)
    });
    this.server.emit('gameStarted', true)
    this.gameIsRunning = true
  }
  // initGame(): Promise<any> {
  //   this.pythonProcess.stdin.write(JSON.stringify(this.dataFromClient) + '\n');
  //   console.log("Data sent to python : ", JSON.stringify(this.dataFromClient));
  //
  //   return new Promise((resolve, reject) => {
  //     this.pythonProcess.stdout.once('data', (data) => {
  //       const jsonData = data.toString().trim();
  //       console.log("Data from python : ", jsonData);
  //       try {
  //         const parsedData = JSON.parse(jsonData);
  //         console.log("Parsed data from python : ", parsedData);
  //         this.server.emit('gameDataToClient', parsedData, this.turn);
  //         resolve(parsedData);
  //       } catch (error) {
  //         console.error("Error parsing data from Python:", error);
  //         reject(error);
  //       }
  //     });
  //
  //     this.pythonProcess.stderr.once('data', (data) => {
  //       const errorMsg = data.toString().trim();
  //       console.error("Error from Python script:", errorMsg);
  //       reject(new Error(errorMsg));
  //     });
  //
  //     this.pythonProcess.on('error', (error) => {
  //       console.error("Error while executing Python script:", error);
  //       reject(error);
  //     });
  //   });
  // }
  executeGameAction(dataClient){
    this.pythonProcess.stdin.write(JSON.stringify(dataClient) + '\n');
    this.pythonProcess.stdout.on('data', data => {
      console.log("Data from python : ", data.toString())
      this.turn = this.inGameSessionPlayers.filter(player => player !== this.turn)[0]
      console.log("Turn of: ", this.turn)
      const gameData = {
        dataFromPython: JSON.parse(data.toString()),
        turn: this.turn
      }
      this.server.emit('gameDataToClient', gameData)
    });
  }



}


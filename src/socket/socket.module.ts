import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MorpionScriptService } from "../morpion_script/morpion_script.service";

@Module({
  providers: [SocketGateway]
})
export class SocketModule {}

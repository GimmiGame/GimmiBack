import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigService,ConfigModule } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import  { UserSchema } from "./user";
import { FriendListService } from "../friend-list/friend-list.service";
import { FriendListSchema } from "../friend-list/friend-list";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
    }),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'FriendList',
        schema: FriendListSchema
      }
    ]),
  ],
  controllers: [UserController],
  providers: [UserService,JwtStrategy,FriendListService],
  exports: [JwtStrategy,PassportModule,UserService]
})
export class UserModule {}


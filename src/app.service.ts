import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getLaunch(): string {
    return 'GimmiBackEnd is running!';
  }
}

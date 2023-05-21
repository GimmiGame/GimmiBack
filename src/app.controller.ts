import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags('App Home')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getLaunch(): string {
    return this.appService.getLaunch();
  }
}

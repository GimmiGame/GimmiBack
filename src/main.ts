import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('gimmiAPI') //Prefix path for all controllers
  await app.listen(3000);
}
bootstrap();

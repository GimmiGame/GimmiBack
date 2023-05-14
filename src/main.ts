import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('gimmiAPI') //Prefix path for all controllers

  //Allow CORS for all origins and headers
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  //Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Gimmi API Swagger')
    .setDescription('Swagger de GimmiGame API. Toutes les routes sont préfixées par /gimmiAPI')
    .setVersion('1.0')
    .build();

  //Create Swagger documentation
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('gimmiAPI/swagger', app, document);

  await app.listen(3000);
}
bootstrap();

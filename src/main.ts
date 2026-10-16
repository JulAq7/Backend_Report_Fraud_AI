import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Documentación OpenAPI generada a partir de los decoradores.
  // Swagger UI queda disponible en /docs y el JSON en /docs-json.
  const config = new DocumentBuilder()
    .setTitle('ReportFraud AI')
    .setDescription(
      'API REST para el registro y gestión de reportes de posibles fraudes digitales. ' +
        'Las rutas de /reportes requieren un access token obtenido en POST /auth/login.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
  //ESTO SE CAMBIO 
  app.enableCors();
  await app.listen(3000);
}

bootstrap();
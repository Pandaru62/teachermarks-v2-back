import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomHttpExceptionFilter } from './auth/custom-exceptions/custom.filter-exception';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());


  app.enableCors({
    origin: "http://localhost:5173",
    methods: ["GET","PUT","PATCH","POST","DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
    exposedHeaders: ["Content-Range", "X-Content-Range"]
   });
   await app.listen(process.env.PORT ?? 3000);

}
bootstrap();

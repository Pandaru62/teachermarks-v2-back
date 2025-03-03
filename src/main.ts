import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

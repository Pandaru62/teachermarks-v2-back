import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomHttpExceptionFilter } from './auth/custom-exceptions/custom.filter-exception';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new CustomHttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  // Support multiple allowed origins via env (comma-separated)
  const frontendUrls = process.env.FRONTEND_URLS?.split(",").map(url => url.trim()) || [];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow non-browser clients like curl/Postman
        return callback(null, true);
      }
      if (frontendUrls.length === 0 || frontendUrls.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  });

  if (frontendUrls.length === 0) {
    console.log("⚠️  CORS enabled for ALL origins (no FRONTEND_URLS set)");
  } else {
    console.log(`✅ CORS enabled for origins: ${frontendUrls.join(", ")}`);
  }

  await app.listen(3000, "0.0.0.0");
}
bootstrap();

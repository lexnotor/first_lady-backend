import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix("/api/v1");
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.listen(process.env.PORT || 3500);
}

bootstrap();

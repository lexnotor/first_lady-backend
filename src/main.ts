import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });

    app.setGlobalPrefix("/api/v1");
    app.enableCors({
        methods: ["POST", "GET", "OPTIONS", "UPDATE", "DELETE"],
        origin: "*",
        allowedHeaders: "*",
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.listen(process.env.PORT || 3500);
}

bootstrap();

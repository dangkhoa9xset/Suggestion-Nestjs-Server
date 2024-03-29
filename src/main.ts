import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import * as fs from 'fs';

async function bootstrap() {
    // const httpsOptions = {
    //     key: fs.readFileSync('./3024169_localhost.key'),
    //     cert: fs.readFileSync('./3024169_localhost.cert'),
    //};
    const app = await NestFactory.create(AppModule, {cors: true});
    const hostDomain = AppModule.isDev ? `${AppModule.host}:${AppModule.port}` : AppModule.host;

    const swaggerOptions = new DocumentBuilder()
        .setTitle('Nest MEAN')
        .setDescription('API Documentation')
        .setVersion('1.0.0')
        .setHost(hostDomain.split('//')[1])
        .setSchemes(AppModule.isDev ? 'http' : 'https')
        .setBasePath('/api')
        .addBearerAuth('Authorization', 'header')
        .build();

    const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);

    SwaggerModule.setup('/api/docs', app, swaggerDoc, {
        swaggerUrl: `${hostDomain}/api/docs-json`,
        explorer: true,
        swaggerOptions: {
            docExpansion: 'list',
            filter: true,
            showRequestDuration: true,
        },
    });

    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(AppModule.port);
}

bootstrap();

import { INestApplication, Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import Environment from 'src/common/enums/environment.enum';

@Injectable()
export class SwaggerService {
  create(app: INestApplication) {
    if (process.env.APP_ENV === Environment.PRODUCTION) {
      return;
    }

    const description = `Definitions for data transfer objects and models used in
    controllers are found in the _Schemas_ section.
    \nAll protected endpoints are indicated by a padlock at the far right of their
    header and therefore require a bearer JWT present in the authentication header.
    This token can be obtained through the sign up and sign in services.
    \nRole requirements for each endpoints is indicated as a summary for quick
    reference. Example: [Admin, User].`;
    const config = new DocumentBuilder()
      .setTitle('SW REST API')
      .setDescription(description)
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        displayRequestDuration: true,
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    };

    SwaggerModule.setup('api-docs', app, document, customOptions);
  }
}

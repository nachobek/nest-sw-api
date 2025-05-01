import { Injectable } from '@nestjs/common';
import { SequelizeModuleOptions, SequelizeOptionsFactory } from '@nestjs/sequelize';
import Environment from '../../common/enums/environment.enum';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadModels: true,
      sync: { alter: { drop: process.env.APP_ENV !== Environment.PRODUCTION } },
      logging: false,
      define: {
        defaultScope: {
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt'],
          },
          subQuery: false,
        },
        paranoid: true,
      },
    };
  }
}

import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, getSchemaPath, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { ApiStandardResponse } from '../classes/api-standard-response.class';

interface ApiResponseOptions<TModel extends Type<any>> {
  status?: number;
  message?: string;
  data?: TModel;
  isArray?: boolean;
  description?: string;
}

export const ApiStandardResponseDecorator = <TModel extends Type<any>>(
  options: ApiResponseOptions<TModel> = {},
) => {
  const { status = 200, message, data, isArray = false, description } = options;

  return applyDecorators(
    ApiExtraModels(ApiStandardResponse, ...(data ? [data] : [])),
    SwaggerApiResponse({
      status,
      description: description || 'Successful operation',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiStandardResponse) },
          {
            properties: {
              status: {
                type: 'number',
                example: status,
              },
              message: message
                ? {
                    type: 'string',
                    example: message,
                  }
                : undefined,
              data: data
                ? isArray
                  ? { type: 'array', items: { $ref: getSchemaPath(data) } }
                  : { $ref: getSchemaPath(data) }
                : { type: 'object' },
            },
          },
        ],
      },
    }),
  );
};

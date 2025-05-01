import { SetMetadata } from '@nestjs/common';
import Constant from '../enums/constant.enum';
import Role from '../enums/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata(Constant.ROLES_KEY, roles);

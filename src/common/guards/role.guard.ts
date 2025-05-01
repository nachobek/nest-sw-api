import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/models/user.model';
import Constant from '../enums/constant.enum';
import Role from '../enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  matchRoles(requiredRoles: Role[], userRole: Role) {
    return requiredRoles.some((role) => role === userRole);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndMerge<Role[]>(Constant.ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!requiredRoles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    return this.matchRoles(requiredRoles, user?.role);
  }
}

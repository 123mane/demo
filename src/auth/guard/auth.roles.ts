import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
export const RoleGuard = (role: number): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      return request.user.roleId == role;
    }
  }

  return mixin(RoleGuardMixin);
};

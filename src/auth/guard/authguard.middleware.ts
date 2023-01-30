import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
export const validateAdmin = (): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      let value = request.user.roleId;
      return value == true;
    }
  }

  return mixin(RoleGuardMixin);
};

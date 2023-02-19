import { IsString } from 'class-validator';

export enum UserPermission {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  permissions: UserPermission[];
}

interface ICreateUserCommand {
  name: string;
  email: string;
}

export class CreateUserCommand {
  public readonly name: string;
  public readonly email: string;
  constructor(userPayload: ICreateUserCommand) {
    Object.assign(this, userPayload);
  }
}

export class CreateUserErrorEvent extends CreateUserCommand {
  public readonly message: string;
  constructor(payload: ICreateUserCommand & { message: string }) {
    super(payload);
  }
}

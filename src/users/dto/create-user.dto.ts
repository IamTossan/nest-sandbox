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

const toSnakeCase = (s: string): string => {
  return s
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export class CreateUserCommand {
  static event_name = toSnakeCase(CreateUserCommand.name);
  public readonly name: string;
  public readonly email: string;
  constructor(userPayload: ICreateUserCommand) {
    Object.assign(this, userPayload);
  }
}

export class CreateUserFailedEvent extends CreateUserCommand {
  static event_name = toSnakeCase(CreateUserFailedEvent.name);
  public readonly message: string;
  constructor(payload: ICreateUserCommand & { message: string }) {
    super(payload);
  }
}

export class UserCreatedEvent extends CreateUserCommand {
  static event_name = toSnakeCase(UserCreatedEvent.name);
  public readonly id: string;
  constructor(payload: ICreateUserCommand & { id: string }) {
    super(payload);
  }
}

import { Optional } from "sequelize";

export interface UserRAttributes {
  id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  role?: string;
    password?: string;
    verified?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }


  export interface UserRSignupAttributes
  extends Optional<
    UserRAttributes,
    | "id"
    | "firstName"
    | "lastName"
    | "password"
    | "email"
    | "role"
    | "verified"
    | "isActive"
    | "createdAt"
    | "updatedAt"
  > {}

export interface UserROutputs extends Required<UserRAttributes> {}
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserRAttributes } from "../types";
import dotenv from "dotenv";

dotenv.config();

const mySecret: Secret = process.env.JWT_SECRET as string;

const generateToken = async (
  user: UserRAttributes,
  expiresIn: string = "30d"
): Promise<string> => {
  return jwt.sign(
    {
      role: user.role,
      email: user.email,
      id: user.id,
      firstName: user.firstName,
    },
    mySecret,
    {
      expiresIn, // This option is correctly typed as a string
    } as SignOptions
  );
};

export { generateToken };

export const decodeToken = (token: string): any => {
  try {
    return jwt.verify(token, mySecret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

import { logout, verifyJWTtoken } from "./core/common";
import {
  loginUser,
  registerUser,
  sendVerificationCode,
  verifyEmailCode,
  deleteUserAccount,
} from "./core/postgresNeon";
import { DatabaseTypes } from "./customTypes/types"; // Adjust the import if necessary

export class Anjum {
  protected database: DatabaseTypes;
  protected name: string;

  constructor({ database, name }: { database: DatabaseTypes; name: string }) {
    this.database = database;
    this.name = name;
  }

  register = async ({
    email,
    password,
    role,
  }: {
    email: string;
    password: string;
    role: "user" | " admin";
  }) => {
    switch (this.database.type) {
      case "postgresNeon":
        return await registerUser({
          db: this.database,
          email: email,
          password: password,
          role: role,
        });
      default:
        return { success: false, message: "failed to register!" };
    }
  };

  login = async ({ email, password }: { email: string; password: string }) => {
    switch (this.database.type) {
      case "postgresNeon":
        return await loginUser({
          email: email,
          password: password,
          db: this.database,
        });
      default:
        return { success: false, message: "failed to login!" };
    }
  };

  getSession = async () => {
    return await verifyJWTtoken({ db: this.database });
  };

  logout = async () => {
    return await logout();
  };
  sendEmailVerificationCode = async ({ email }: { email: string }) => {
    switch (this.database.type) {
      case "postgresNeon":
        return await sendVerificationCode({
          email: email,
          app_name: this.name,
          db: this.database,
        });
        break;
      default:
        return {
          success: false,
          message: "Invalid database type",
        };
    }
  };

  verifyEmailVerificationCode = async ({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) => {
    switch (this.database.type) {
      case "postgresNeon":
        return await verifyEmailCode({
          email: email,
          code: code,
          db: this.database,
        });
        break;

      default:
        return {
          success: false,
          message: "Invalid database type",
        };
        break;
    }
  };

  deleteAccount = async ({ email }: { email: string }) => {
    switch (this.database.type) {
      case "postgresNeon":
        return await deleteUserAccount({ email: email, db: this.database });
      default:
        return {
          success: false,
          message: "Invalid database type",
        };
    }
  };
}

import { NeonQueryFunction } from "@neondatabase/serverless";

//types for various DB adapters
export type userSchema = {
  id: number;
  createdAt: Date;
  email: string;
  password: string;
  role: "user" | "admin";
};

// neon postgresql database adapter
export type NeonConnectionType = {
  type: string;
  connection: NeonQueryFunction<false, false>;
};

export type mongoDBConnectionType = {
  type: string;
  connection: any;
};

export type DatabaseTypes = NeonConnectionType | mongoDBConnectionType;

import { neon } from "@neondatabase/serverless";

export const PostgresNeon = () => {
  const conn = neon(process.env.NEON_KEY!);
  return {
    type: "postgresNeon",
    connection: conn,
  };
};

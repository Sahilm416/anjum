import { neon } from "@neondatabase/serverless";

export const initPostgresNeon = async (key) => {
  try {
    const conn = neon(key);
    const createAnjumTableSQL = `
   CREATE TABLE IF NOT EXISTS anjum (
     id SERIAL PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     role TEXT NOT NULL,
     failed_attempts INT DEFAULT 0,
     last_failed_attempt NUMERIC,
     is_locked BOOLEAN DEFAULT FALSE,
     pwd_version NUMERIC NOT NULL
   )
 `;
    const createOtpTable = `
 CREATE TABLE IF NOT EXISTS anjum_otp(
  id SERIAL,
  email TEXT UNIQUE NOT NULL PRIMARY KEY,
  otp NUMERIC NOT NULL,
  last_otp_attempt NUMERIC,
  failed_attempts NUMERIC,
  total_attempts NUMERIC
 )`;
    await conn(createAnjumTableSQL);
    await conn(createOtpTable);

    return {
      success: true,
      message: "Successfully created anjum table",
    };
  } catch (error) {
    if (error.message.includes("not a valid")) {
      return { success: false, message: "Invalid NEON_KEY provided" };
    }
    return { success: false, message: "Error creating anjum table: " };
  }
};

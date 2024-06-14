import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import { verifyMail } from "../email/code";
import { DatabaseTypes } from "src/customTypes/types";

export const getJWTsecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  } else {
    throw new Error("JWT secret not set!");
  }
};

export const getMailUserAndPassword = () => {
  const email = process.env.MAIL_USERNAME;
  const password = process.env.MAIL_PASSWORD;
  if (!email) {
    throw new Error("No MAIL_USERNAME found in the environment variables!");
  }
  if (!password) {
    throw new Error("No MAIL_PASSWORD found in the environment variables!");
  }

  return {
    email: email,
    password: password,
  };
};

export const setJWTcookie = async ({
  id,
  email,
  role,
  pwdVersion,
}: {
  email: string;
  id: number;
  role: string;
  pwdVersion: number;
}) => {
  const cookieStore = cookies();
  try {
    const access_token = await new SignJWT({
      id: id,
      role: role,
      pwdVersion: pwdVersion,
      email: email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1m")
      .sign(new TextEncoder().encode(getJWTsecret()));

    const refresh_token = await new SignJWT({
      id: id,
      email: email,
      pwdVersion: pwdVersion,
      role: role,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setExpirationTime("30 days")

      .sign(new TextEncoder().encode(getJWTsecret()));

    cookieStore.set("_a_token", access_token);
    cookieStore.set("_r_token", refresh_token);
  } catch (error: any) {
    console.log("Error: ", error.message);
  }
};

const refreshTokenMehanism = async ({ db }: { db: DatabaseTypes }) => {
  const cookieStore = cookies();

  const refresh_token = cookieStore.get("_r_token")?.value;

  if (refresh_token) {
    try {
      const { payload } = (await jwtVerify(
        refresh_token,
        new TextEncoder().encode(getJWTsecret())
      )) as {
        payload: {
          id: number;
          role: string;
          pwdVersion: number;
          email: string;
        };
      };

      switch (db.type) {
        case "postgresNeon":
          const [row] = await db.connection(
            `SELECT * FROM anjum where email = $1`,
            [payload.email]
          );
          if (payload.pwdVersion < parseInt(row.pwd_version)) {
            cookieStore.delete("_r_token");
            return {
              success: false,
              message: "User is logged out",
              data: null,
            };
          }
          break;
        default:
          return {
            success: false,
            message: "Invalid database connection",
            data: null,
          };
          break;
      }

      const new_token = await new SignJWT({
        ...payload,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1m")
        .sign(new TextEncoder().encode(getJWTsecret()));

      cookieStore.set("_a_token", new_token);

      return {
        success: true,
        message: "User logged in",
        data: payload,
      };
    } catch (error) {
      cookieStore.delete("_r_token");
      return {
        success: false,
        message: "User logged out",
        data: null,
      };
    }
  } else {
    return {
      success: true,
      message: "Token not found",
      data: null,
    };
  }
};
export const verifyJWTtoken = async ({ db }: { db: DatabaseTypes }) => {
  const cookieStore = cookies();
  try {
    const access_token = cookieStore.get("_a_token")?.value;
    if (!access_token) {
      const res = await refreshTokenMehanism({ db: db });
      return {
        success: res.success,
        message: res.message,
        data: res.data,
      };
    }

    const { payload } = (await jwtVerify(
      access_token,
      new TextEncoder().encode(getJWTsecret())
    )) as {
      payload: { id: number; role: string; pwdVersion: number; email: string };
    };

    return {
      success: true,
      message: "User is logged in",
      data: payload,
    };
  } catch (error) {
    const res = await refreshTokenMehanism({ db: db });
    return {
      success: res.success,
      message: res.message,
      data: res.data,
    };
  }
};

export const logout = async () => {
  const cookieStore = cookies();
  try {
    cookieStore.delete("_a_token");
    cookieStore.delete("_r_token");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to log out",
    };
  }
};

/* Method to send verification code ! */

export const sendCodeWithNodemailer = async ({
  email,
  app_name,
  code,
}: {
  email: string;
  app_name: string;
  code: number;
}) => {
  try {
    const credentials = getMailUserAndPassword();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: credentials.email,
        pass: credentials.password!,
      },
    });

    const mailOptions = {
      from: `${app_name} <${getMailUserAndPassword().email}>`,
      to: email,
      subject: `Verify Email for ${app_name}`,
      html: verifyMail({
        email: email,
        code: code,
        project: app_name,
      }),
    };

    const info = await transporter.sendMail(mailOptions);

    if (info.accepted.length > 0) {
      return {
        success: true,
        message: "Verification code sent successfully",
      };
    } else {
      return {
        success: false,
        message: "Failed to send verification code!",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong!",
    };
  }
};

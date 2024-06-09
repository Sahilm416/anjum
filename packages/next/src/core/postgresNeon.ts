import { DatabaseTypes, NeonConnectionType } from "../customTypes/types";
import { sendCodeWithNodemailer, setJWTcookie } from "./common";

/* regsiter new user */
export const registerUser = async ({
  db,
  email,
  password,
  role,
}: {
  db: NeonConnectionType;
  email: string;
  password: string;
  role: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const values = [email, password, role, Date.now()];
    const user = await db.connection(
      `SELECT * FROM anjum WHERE email = $1`,
      values.slice(0, 1)
    );

    if (user[0]) {
      return {
        success: false,
        message: "User already exists!",
      };
    }

    // console.log(user);
    const query = `INSERT INTO anjum (email, password, role , pwd_version) VALUES ($1, $2, $3 , $4);`;

    await db.connection(query, values);
    await loginUser({ email: email, password: password, db: db });

    return {
      success: true,
      message: "Created user successfully!",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "something went wrong!",
    };
  }
};

/*Login method*/
export const loginUser = async ({
  email,
  password,
  db,
}: {
  email: string;
  password: string;
  db: NeonConnectionType;
}) => {
  try {
    const user_query = await db.connection(
      `SELECT * FROM anjum WHERE email = $1`,
      [email]
    );
    const user = user_query[0];
    // console.log(user);

    if (!user) {
      return {
        success: false,
        message: "User not found!",
      };
    }

    // Check if the account is locked

    if (user.is_locked) {
      const lock_duration = 5 * 60 * 1000;
      const last_failed_attempt_time = user.last_failed_attempt;
      const current_time = Date.now();

      if (current_time - last_failed_attempt_time > lock_duration) {
        // Unlock the account since 10 minutes have passed
        await db.connection(
          `UPDATE anjum SET is_locked = FALSE, failed_attempts = 0, last_failed_attempt = NULL WHERE email = $1`,
          [email]
        );
      } else {
        return {
          success: false,
          message: "Account is locked. Please try again later.",
        };
      }
    }

    // Check the password
    if (user.password === password) {
      // Reset failed attempts on successful login
      await db.connection(
        `UPDATE anjum SET failed_attempts = 0, last_failed_attempt = NULL, is_locked = FALSE WHERE email = $1`,
        [email]
      );

      await setJWTcookie({
        id: user.id,
        email: user.email,
        role: user.role,
        pwdVersion: parseInt(user.pwd_version),
      });
      return {
        success: true,
        message: "Login successful!",
      };
    } else {
      // Increment failed attempts
      const new_failed_attempts = (user.failed_attempts || 0) + 1;
      const is_locked = new_failed_attempts >= 10; // Lock the account if failed attempts reach 5
      const failed_attempt_time = Date.now();
      await db.connection(
        `UPDATE anjum SET failed_attempts = $1, last_failed_attempt = $2, is_locked = $3 WHERE email = $4`,
        [new_failed_attempts, failed_attempt_time, is_locked, email]
      );

      return {
        success: false,
        message: "Invalid email or password!",
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

export const sendVerificationCode = async ({
  email,
  db,
  app_name,
}: {
  email: string;
  db: NeonConnectionType;
  app_name: string;
}) => {
  try {
    const [row] = await db.connection(
      `SELECT * FROM anjum_otp WHERE email = $1`,
      [email]
    );

    const now = Date.now();
    const otp = Math.floor(100000 + Math.random() * 900000);

    if (!row) {
      await db.connection(
        `INSERT INTO anjum_otp (email, otp, last_otp_attempt, failed_attempts, total_attempts) VALUES ($1, $2, $3, $4, $5)`,
        [email, otp, now, 0, 1]
      );
    } else {
      const { total_attempts, last_otp_attempt } = row;

      // Check if user has exceeded daily attempt limit
      if (total_attempts > 30 && now - parseInt(last_otp_attempt) < 12 * 60 * 60 * 1000) {
        return {
          success: false,
          message: "You've exceeded the maximum daily attempts.",
        };
      }

      // Reset failed attempts and total attempts after 24 hours
      if (now - parseInt(last_otp_attempt) > 24 * 60 * 60 * 1000) {
        await db.connection(
          `UPDATE anjum_otp SET failed_attempts = 0, total_attempts = 1, last_otp_attempt = $1, otp = $2 WHERE email = $3`,
          [now, otp, email]
        );
      } else {
        // Check if user is sending too many requests
        if (now - parseInt(last_otp_attempt) < 1 * 60 * 1000) {
          return {
            success: false,
            message: "Too many attempts, please wait.",
          };
        }

        // Update the existing row
        await db.connection(
          `UPDATE anjum_otp SET otp = $1, last_otp_attempt = $2, total_attempts = total_attempts + 1 WHERE email = $3`,
          [otp, now, email]
        );
      }
    }

    const { success, message } = await sendCodeWithNodemailer({
      email,
      app_name,
      code: otp,
    });

    return { success, message };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
};

export const verifyEmailCode = async ({
  email,
  code,
  db,
}: {
  email: string;
  code: string;
  db: NeonConnectionType;
}) => {
  try {
    const [row] = await db.connection(
      `SELECT * FROM anjum_otp WHERE email = $1`,
      [email]
    );

    if (!row) {
      return {
        success: false,
        message: "Invalid verification code",
      };
    }

    if (Date.now() - parseInt(row.last_failed_attempt, 10) > 3 * 60 * 1000) {
      await db.connection(`DELETE FROM anjum_otp WHERE email = $1`, [email]);
      return {
        success: false,
        message: "Invalid verification code",
      };
    }

    if (row.failed_attempts > 5) {
      await db.connection(`DELETE FROM anjum_otp WHERE email = $1`, [email]);
      return {
        success: false,
        message: "Too many attempts , please try again!",
      };
    }

    if (parseInt(row.otp, 10) === parseInt(code, 10)) {
      await db.connection(`DELETE FROM anjum_otp WHERE email = $1`, [email]);
      return {
        success: true,
        message: "Valid verification code",
      };
    } else {
      await db.connection(
        `UPDATE anjum_otp SET failed_attempts = $1 WHERE email = $2`,
        [parseInt(row.failed_attempts) + 1, email]
      );

      return {
        success: false,
        message: "Invalid verification code",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
};

/*
Delete user account from anjum table
*/

export const deleteUserAccount = async ({
  email,
  db,
}: {
  email: string;
  db: DatabaseTypes;
}) => {
  try {
    await db.connection(`DELETE FROM anjum WHERE email = $1`, [email]);
    return {
      success: true,
      message: "successfully deleted user account",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
};

/*
Method to reset the password
*/

export const resetUserPassword = async ({
  email,
  password,
  db,
}: {
  email: string;
  password: string;
  db: DatabaseTypes;
}) => {
  try {
    const [row] = await db.connection(`SELECT * FROM anjum where email = $1`, [
      email,
    ]);
    if (!row) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await db.connection(
      `UPDATE anjum SET password = $1 , pwd_version = $2 WHERE email = $3`,
      [password, Date.now(), email]
    );

    return {
      success: true,
      message: "Successfully updated the password",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
};

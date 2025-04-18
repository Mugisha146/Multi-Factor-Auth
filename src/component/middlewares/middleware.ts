import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { sendEmail } from "../utils/email.util";
import jwt from 'jsonwebtoken'
import { errorResponse } from '../utils/response.utils'
import { USER_MESSAGES, JWT_CONSTANTS } from '../utils/variable.utils'

interface OTPStore {
  [key: string]: {
    otp: string;
    expiry: number;
  };
}

const otpStore: OTPStore = {}; // Store OTPs with expiry times

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString().padStart(6, "0");
}

export const sendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json("Email is required");
    return;
  }

  const otp = generateOTP();
  const expiry = Date.now() + 300000; // OTP valid for 5 minutes

  otpStore[email] = { otp, expiry };

  // Professional Email Subject
  const subject = "Verification Code";

  // Professional Plain Text Email Body
  const text = `
Dear User,

We have received a request to enter in NPC-DataVault. Please use the code provided below to complete your verification. 

Your OTP is: ${otp}

Note: This OTP is valid for the next 5 minutes. If you did not request this verification, please ignore this email or contact our support team immediately.

Thank you for choosing our services.

Best regards,
National Police College  `;

  // Professional HTML Email Body
  const html = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <h2 style="color: #2c3e50;">Verification Code</h2>
  <p>Dear User,</p>
  <p>We have received a request to enter in NPC-DataVault System. Please use the code provided below to complete your verification:</p>
  <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">${otp}</p>
  <p><em>Note: This code is valid for the next 5 minutes.</em></p>
  <p>If you did not request this verification, please ignore this email or contact our support team immediately.</p>
  <p>Thank you for choosing our services.</p>
  <p>Best regards,<br>National Police College</p>
</div>
  `;

  try {
    sendEmail(email, subject, text, html);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json("Error sending OTP email");
  }

  next();
};

export const verifyOTP = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json("Email and OTP are required");
    return;
  }

  const otpData = otpStore[email];

  if (!otpData) {
    res.status(400).json({message: "OTP not found or expired"});
    return;
  }

  if (Date.now() > otpData.expiry) {
    res.status(400).json({message: "OTP expired"});
    return;
  }

  if (otpData.otp !== otp) {
    res.status(400).json({message: "Invalid OTP"});
    return;
  }

  delete otpStore[email]; // OTP verified, remove from store
  res.status(200).json({message: "OTP verified successfully"});
  next();
};


export const getTokenFromRequest = (req: Request): string | null => {
  if (req.query.token) {
    return req.query.token as string
  }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1]
  }
  if (req.body.token) {
    return req.body.token
  }
  return null
}

export const verifyTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = getTokenFromRequest(req)

  if (!token) {
    errorResponse(res, 400, USER_MESSAGES.INVALID_TOKEN)
    return 
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_CONSTANTS.SECRET_KEY,
    ) as jwt.JwtPayload // Cast to JwtPayload
    ;(req as any).decoded = decoded // Attach the decoded token to the request object
    next() // Call the next middleware
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      errorResponse(res, 400, USER_MESSAGES.INVALID_TOKEN)
      return 
    }
    errorResponse(res, 500, USER_MESSAGES.INTERNAL_SERVER_ERROR)
    return 
  }
}
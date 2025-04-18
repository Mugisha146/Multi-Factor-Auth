import { Request, Response, NextFunction } from 'express'
import { UserRSignupAttributes } from './types'
import { UserRService } from './service'
import { generateToken } from './utils/tokenGenerator.utils'
import { hashPassword, comparePassword } from './utils/password.util'
import { sendEmail } from './utils/email.util'
import { sendOTP } from './middlewares/middleware'
import { errorResponse } from './utils/response.utils'
import { USER_MESSAGES, JWT_CONSTANTS } from './utils/variable.utils'


export const userSignup = async (req: Request, res: Response) => {
  try {
    const hashedpassword: any = await hashPassword(req.body.password)
    const user: UserRSignupAttributes = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedpassword,
      role: req.body.role,
      updatedAt: new Date(),
      createdAt: new Date(),
    }

    const createdUser = await UserRService.register(user)
    const token = await generateToken(createdUser, '1d')

    const verificationLink = `${process.env.BACKEND_URL}/api/users/verify-email?token=${token}`
    
    // Email Subject
    const subject = 'Email Verification'

    // Plain Text Email Body
    const text = `
Dear ${user.firstName},

Thank you for registering with us. To complete your signup, please verify your email address by clicking the link below:

${verificationLink}

If you did not create an account with us, please disregard this message and Report.

Best regards
    `

    // Professional HTML Email Body
    const html = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <h2 style="color: #2c3e50;">Email Verification</h2>
  <p>Dear ${user.firstName},</p>
  <p>Thank you for registering with us. To complete your signup, please verify your email address by clicking the button below:</p>
  <p>
    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 4px;">
      Verify Email
    </a>
  </p>
  <p>If you did not create an account with us, please disregard this message and Report.</p>
  <p>Best regards</p>
</div>
    `

    await sendEmail(user.email, subject, text, html)

    const userWithoutPassword = { ...createdUser.dataValues }
    delete userWithoutPassword.password

    res.status(200).json({
      status: 'success',
      message: 'User created successfully',
      token: token,
    })
  } catch (error) {
    console.log(error, 'Error in creating account')
    res.status(500).json({
      status: 'error',
      message: 'Error in creating account',
    })
  }
}

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Fetch user by email
    const user = await UserRService.getUserRByEmail(email)
    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      })
      return
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        status: 'fail',
        message: 'Oops, this account is deactivated',
      })
      return
    }

    // Check if user is verified
    if (!user.verified) {
      const token = await generateToken(user, '1h') // Generate a short-lived token
      const verificationLink = `${process.env.BACKEND_URL}/api/users/verify-email?token=${token}`

      // Professional Email Subject
      const subject = 'Email Verification Required'

      // Professional Plain Text Email Body
      const text = `
Dear ${user.firstName},

We noticed that your email address is not yet verified. To secure your account and ensure full access, please verify your email by clicking on the link below:

${verificationLink}

If you did not create an account with us, please ignore this message and Report.

      `

      // Professional HTML Email Body
      const html = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <h2 style="color: #2c3e50;">Email Verification Required</h2>
  <p>Dear ${user.firstName},</p>
  <p>We noticed that your email address is not yet verified. To secure your account and ensure full access, please verify your email by clicking the button below:</p>
  <p>
    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 4px;">
      Verify Email
    </a>
  </p>
  <p>If you did not create an account with us, please ignore this message and Report.</p>
</div>
      `

      await sendEmail(user.email, subject, text, html) // Assuming sendEmail is async
      res.status(403).json({
        message: 'This user is not verified. Check your email to verify your account.',
      })
      return
    }

    // Compare the provided password with the stored one
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      })
      return
    }

    // Generate JWT token
    const token = await generateToken(user)

    // Remove password from the user object
    const userWithoutPassword = { ...user.dataValues }
    delete userWithoutPassword.password

    if (user) {
      req.body.email = email
      await sendOTP(req, res, () => {
        res.status(200).json({
          status: 'success',
          message: 'Login successful. OTP sent',
          token: token,
          data: {
            user: userWithoutPassword,
          },
        })
      })
      return // Ensure we exit after sending the OTP
    }

    // For other roles, just send the response
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token: token,
      data: {
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login',
    })
  }
}



export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const decoded = (req as any).decoded
    const user = await UserRService.getUserRByEmail(decoded.email)

    if (!user) {
        errorResponse(res, 404, USER_MESSAGES.USER_NOT_FOUND)
        return;
    }

    user.verified = true
    await UserRService.updateUserR(user)

    // (Re‑)issue an auth token if you need it for the client
    const authToken = await generateToken(user, JWT_CONSTANTS.AUTH_TOKEN_EXPIRY)

    // Send a simple HTML page with a Back Home link
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Email Verified</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            padding: 20px;
            text-align: center;
            background-color: #f7f7f7;
          }
          h1 { color: #2c3e50; }
          p  { font-size: 18px; }
          a.button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <h1>Email Verified Successfully</h1>
        <p>Your email has been successfully verified.</p>
        <a href="/" class="button">Back Home</a>
      </body>
      </html>
    `)
  } catch (error) {
      errorResponse(res, 500, USER_MESSAGES.INTERNAL_SERVER_ERROR)
      return;
  }
}

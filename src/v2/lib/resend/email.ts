import { type EmailData, Resend } from "@/v2/lib/resend/wrapper"
import type { Context } from "hono"

const emailFrom = "Test <test@test.wanderer.moe>"

const sendEmail = async (emailData: EmailData, ctx: Context) => {
    try {
        const resend = new Resend(ctx)
        await resend.sendEmail(emailData)
    } catch (error) {
        throw new Error(`[RESEND]: ${error.message}`)
    }
}

const createEmailData = (
    to: string,
    subject: string,
    html: string
): EmailData => {
    return {
        from: emailFrom,
        to,
        subject,
        html,
    }
}

export const sendPasswordResetEmail = async (
    email: string,
    link: string,
    username: string,
    ctx: Context
) => {
    const emailData = createEmailData(
        email,
        "Password Reset Request",
        `<strong>Password reset for ${username}</strong><br /><a href="${link}">Click here to reset your password</a>`
    )
    return sendEmail(emailData, ctx)
}

export const sendPasswordChangeEmail = async (
    email: string,
    username: string,
    ctx: Context
) => {
    const emailData = createEmailData(
        email,
        "Password Change Request",
        `<strong>Your password for ${username} has been changed.</strong><br /> Wasn't you? Contact us at <a href="mailto:support@wanderer.moe">support@wanderer.moe</a>`
    )
    return sendEmail(emailData, ctx)
}

export const sendEmailChangeEmail = async (
    email: string,
    username: string,
    ctx: Context
) => {
    const emailData = createEmailData(
        email,
        "Email Change Request",
        `<strong>Your email address for ${username} has been changed.</strong><br /> Wasn't you? Contact us at <a href="mailto:support@wanderer.moe">support@wanderer.moe</a>`
    )
    return sendEmail(emailData, ctx)
}

export const sendEmailConfirmationEmail = async (
    email: string,
    link: string,
    username: string,
    ctx: Context
) => {
    const emailData = createEmailData(
        email,
        "Email Confirmation",
        `<strong>Email confirmation for ${username}</strong><br /><a href="${link}">Click here to confirm your email</a>`
    )
    return sendEmail(emailData, ctx)
}
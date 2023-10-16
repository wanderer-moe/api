import { ResendWrapper } from "@/v2/lib/resend/wrapper"

const emailFrom = "Test <test@test.wanderer.moe>"

const sendEmail = async (emailData, c) => {
    try {
        return await ResendWrapper(c, emailData)
    } catch (error) {
        throw new Error("Error sending email.")
    }
}

export const sendPasswordResetEmail = async (email, link, username, c) => {
    const emailData = {
        from: emailFrom,
        to: email,
        subject: "Password Reset Request",
        html: `<strong>Password reset for ${username}</strong><br /><a href="${link}">Click here to reset your password</a>`,
    }

    return sendEmail(emailData, c)
}

export const sendPasswordChangeEmail = async (email, username, c) => {
    const emailData = {
        from: emailFrom,
        to: email,
        subject: "Password Updated Confirmation",
        html: `<strong>Your password for ${username} has been updated.</strong><br /> Wasn't you? Contact us at <a href="mailto:support@wanderer.moe">support@wanderer.moe</a>`,
    }

    return sendEmail(emailData, c)
}

export const sendEmailChangeEmail = async (email, username, c) => {
    const emailData = {
        from: emailFrom,
        to: email,
        subject: "Email Change Request",
        html: `<strong>Your email address for ${username} has been changed.</strong><br /> Wasn't you? Contact us at <a href="mailto:support@wanderermoe">support@wanderer.moe</a>`,
    }

    return sendEmail(emailData, c)
}

export const sendEmailConfirmationEmail = async (email, link, username, c) => {
    const emailData = {
        from: emailFrom,
        to: email,
        subject: "Email Confirmation",
        html: `<strong>Email confirmation for ${username}</strong><br /><a href="${link}">Click here to confirm your email</a>`,
    }

    return sendEmail(emailData, c)
}

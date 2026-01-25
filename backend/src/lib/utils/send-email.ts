import { User } from "better-auth"
import { companyInfo } from "config"

export function sendingEmailSimulator({ to, subject, text }: { to: string, subject: string, text: string }) {
    console.log(`
    Simulating sending email
    To: ${to}

    Subject: ${subject}
    ${text}
    `)
}

export function sendEmail({ to, subject, text }: { to: string, subject: string, text: string }) {
    sendingEmailSimulator({ to, subject, text })
}
export async function sendResetPasswordEmail({ user, url }: { user: User, url: string }) {
    sendEmail({
        to: user.email,
        subject: `Reset your ${companyInfo.name} password`,
        text: `Hello ${user.name},

We received a request to reset the password for your ${companyInfo.name} account.

To create a new password, please click the link below:

${url}

For your security, this link will expire after a short period of time and can only be used once.

If you did not request a password reset, please ignore this email. Your account will remain secure and no changes will be made.

If you need further assistance, please contact us at ${companyInfo.email}.

Best regards,
${companyInfo.name} Support Team
`
    })
}

export async function sendVerificationEmail({ user, url }: { user: User, url: string }) {
    void sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        text: `Click the link to verify your email: ${url}`
    })
}
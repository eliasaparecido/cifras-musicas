import nodemailer from "nodemailer";

interface ResetEmailInput {
    to: string;
    userName: string;
    resetUrl: string;
}

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true";

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
}

export async function sendResetPasswordEmail(input: ResetEmailInput): Promise<boolean> {
    const transporter = getTransporter();
    if (!transporter) {
        return false;
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@cifras-musicais.local";

    await transporter.sendMail({
        from,
        to: input.to,
        subject: "Recuperacao de senha - Cifras Musicais",
        text: `Ola ${input.userName},\n\nRecebemos uma solicitacao para redefinir sua senha.\n\nAcesse este link para definir uma nova senha:\n${input.resetUrl}\n\nSe voce nao solicitou, ignore este email.\n`,
    });

    return true;
}

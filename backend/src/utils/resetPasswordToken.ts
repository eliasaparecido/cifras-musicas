import crypto from "crypto";

interface ResetTokenPayload {
    userId: string;
    email: string;
    exp: number;
}

function getSecret(): string {
    return process.env.AUTH_RESET_SECRET || "cifras-musicas-reset-secret-dev";
}

function encodeBase64Url(input: string): string {
    return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64Url(input: string): string {
    return Buffer.from(input, "base64url").toString("utf8");
}

export function createResetPasswordToken(
    userId: string,
    email: string,
    expiresInMinutes = 30,
): string {
    const payload: ResetTokenPayload = {
        userId,
        email,
        exp: Date.now() + expiresInMinutes * 60 * 1000,
    };

    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const signature = crypto
        .createHmac("sha256", getSecret())
        .update(encodedPayload)
        .digest("base64url");

    return `${encodedPayload}.${signature}`;
}

export function verifyResetPasswordToken(token: string): ResetTokenPayload | null {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) {
        return null;
    }

    const expectedSignature = crypto
        .createHmac("sha256", getSecret())
        .update(encodedPayload)
        .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) {
        return null;
    }

    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
    }

    try {
        const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as ResetTokenPayload;
        if (!parsed.userId || !parsed.email || !parsed.exp) {
            return null;
        }

        if (parsed.exp < Date.now()) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

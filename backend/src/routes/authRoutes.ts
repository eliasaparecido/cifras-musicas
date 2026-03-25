import { Router } from "express";
import { z } from "zod";
import prisma from "../db/prisma.js";
import {
  generateAuthToken,
  hashPassword,
  verifyPassword,
} from "../utils/passwordUtils.js";
import { requireAuthUser } from "../utils/requestAuth.js";
import {
  createResetPasswordToken,
  verifyResetPasswordToken,
} from "../utils/resetPasswordToken.js";
import { sendResetPasswordEmail } from "../utils/email.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const normalizedEmail = data.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ error: "Já existe usuário com esse email" });
    }

    const token = generateAuthToken();

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(data.password),
        authToken: token,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    return res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }

    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const token = generateAuthToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { authToken: token },
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }

    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
});

router.get("/me", async (req, res) => {
  const user = await requireAuthUser(req, res);
  if (!user) {
    return;
  }

  res.json({ user });
});

router.post("/logout", async (req, res) => {
  const user = await requireAuthUser(req, res);
  if (!user) {
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { authToken: null },
  });

  res.status(204).send();
});

router.post("/change-password", async (req, res) => {
  const user = await requireAuthUser(req, res);
  if (!user) {
    return;
  }

  try {
    const data = changePasswordSchema.parse(req.body);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (!verifyPassword(data.currentPassword, dbUser.passwordHash)) {
      return res.status(401).json({ error: "Senha atual inválida" });
    }

    const newToken = generateAuthToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(data.newPassword),
        authToken: newToken,
      },
    });

    return res.json({
      message: "Senha alterada com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token: newToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }

    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user) {
      const token = createResetPasswordToken(user.id, user.email);
      const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${frontendBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;

      const sentByEmail = await sendResetPasswordEmail({
        to: user.email,
        userName: user.name,
        resetUrl,
      });

      if (!sentByEmail) {
        // Fallback simples para ambiente sem SMTP configurado.
        console.info("[RESET PASSWORD LINK]", resetUrl);
      }
    }

    return res.json({
      message: "Se o email existir, você receberá instruções para redefinir a senha.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }

    console.error("Error requesting password reset:", error);
    return res.status(500).json({ error: "Erro ao solicitar redefinição de senha" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const payload = verifyResetPasswordToken(data.token);

    if (!payload) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.email !== payload.email) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(data.newPassword),
        authToken: null,
      },
    });

    return res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }

    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Erro ao redefinir senha" });
  }
});

export default router;

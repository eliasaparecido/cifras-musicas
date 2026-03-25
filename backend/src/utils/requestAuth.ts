import { Request, Response } from "express";
import prisma from "../db/prisma.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const token = extractToken(req);
  if (!token) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: { authToken: token },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  return user;
}

export async function requireAuthUser(
  req: Request,
  res: Response
): Promise<AuthUser | null> {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "É necessário fazer login" });
    return null;
  }

  return user;
}

export function canEditResource(
  ownerId: string | null,
  isPublic: boolean,
  user: AuthUser
): boolean {
  if (user.isAdmin) {
    return true;
  }

  if (!isPublic) {
    return ownerId === user.id;
  }

  return true;
}

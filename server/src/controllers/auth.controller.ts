import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User";
import { envelopeError, envelopeOk } from "../utils/response";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  role: z.enum(["candidate", "interviewer"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(payload: {
  id: string;
  role: "candidate" | "interviewer";
  email: string;
  name: string;
}) {
  const secret = process.env.JWT_SECRET || "";
  if (!secret) throw new Error("JWT_SECRET is missing");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  const { name, email, password, role } = parsed.data;
  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) return envelopeError(res, "Email already in use", 400);

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role,
  });

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return envelopeOk(
    res,
    {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
    201,
  );
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  const { email, password } = parsed.data;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return envelopeError(res, "Invalid credentials", 400);

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return envelopeError(res, "Invalid credentials", 400);

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return envelopeOk(res, {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}

export async function me(req: Request, res: Response) {
  const user = req.user;
  if (!user) return envelopeError(res, "Unauthorized", 401);

  const dbUser = await User.findById(user.id).select("-password").lean();
  if (!dbUser) return envelopeError(res, "Unauthorized", 401);

  return envelopeOk(res, {
    id: dbUser._id.toString(),
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    createdAt: dbUser.createdAt,
  });
}


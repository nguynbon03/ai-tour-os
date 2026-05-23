import { Router } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { verifyToken } from "../middleware/auth";
import { logAction } from "../utils/actionLog";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user || !user.password) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await argon2.verify(user.password, body.password);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await logAction({
      req,
      userId: user.id,
      entity: "user",
      entityId: user.id,
      action: "login",
    });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/verify", verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, avatar: true },
    });

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;

import { z } from "zod";

export const LoginValidator = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").trim(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password cannot exceed 100 characters"),
});

export type LoginCredentials = z.infer<typeof LoginValidator>;
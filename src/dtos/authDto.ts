import { z } from "zod";

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export type LoginRequestDto = z.infer<typeof LoginSchema>;

export interface LoginResponseDto {
	token: string;
}
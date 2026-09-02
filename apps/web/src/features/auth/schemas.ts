import z from "zod";

export const signInSchema = z.object({
	email: z.email("Email không hợp lệ"),
	password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const signUpSchema = z.object({
	name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
	email: z.email("Email không hợp lệ"),
	password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

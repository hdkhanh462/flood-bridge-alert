import z from "zod";

export const profileSchema = z.object({
	name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
});

export const emailSchema = z.object({
	email: z.email("Email không hợp lệ"),
});

export const passwordSchema = z.object({
	currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
	newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
});

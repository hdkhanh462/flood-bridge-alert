import { auth } from "@flood-bridge-alert/auth";
import prisma from "@flood-bridge-alert/db";
import { env } from "@flood-bridge-alert/env/server";

async function main() {
  const email = env.SUPERADMIN_EMAIL;
  const password = env.SUPERADMIN_PASSWORD;
  const name = env.SUPERADMIN_NAME;

  if (!email || !password) {
    throw new Error(
      "SUPERADMIN_EMAIL và SUPERADMIN_PASSWORD phải được set để seed tài khoản superadmin",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: "admin" } });
    console.log(`Đã đảm bảo user ${email} có quyền admin.`);
    return;
  }

  await auth.api.signUpEmail({ body: { email, password, name } });
  await prisma.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`Đã tạo superadmin: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

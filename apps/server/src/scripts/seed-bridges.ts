import prisma from "@flood-bridge-alert/db";

const BRIDGES = [
  {
    name: "Cầu tràn Nà Hang",
    location: "Nà Hang, Tuyên Quang",
    latitude: 22.3167,
    longitude: 105.3667,
    threshold: { safeMax: 1.5, warningMax: 2.5 },
  },
  {
    name: "Cầu tràn Mù Cang Chải",
    location: "Mù Cang Chải, Yên Bái",
    latitude: 21.85,
    longitude: 104.1167,
    threshold: { safeMax: 1.2, warningMax: 2.0 },
  },
  {
    name: "Cầu tràn Bắc Mê",
    location: "Bắc Mê, Hà Giang",
    latitude: 22.7833,
    longitude: 105.1167,
    threshold: { safeMax: 1.0, warningMax: 1.8 },
  },
  {
    name: "Cầu tràn Bảo Lạc",
    location: "Bảo Lạc, Cao Bằng",
    latitude: 22.9333,
    longitude: 105.6667,
    threshold: { safeMax: 1.3, warningMax: 2.2 },
  },
];

async function main() {
  for (const { threshold, ...bridge } of BRIDGES) {
    const existing = await prisma.bridge.findFirst({
      where: { name: bridge.name },
    });
    if (existing) {
      console.log(`Bỏ qua (đã tồn tại): ${bridge.name}`);
      continue;
    }

    await prisma.bridge.create({
      data: { ...bridge, threshold: { create: threshold } },
    });
    console.log(`Đã tạo: ${bridge.name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

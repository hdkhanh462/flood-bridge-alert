import z from "zod";

export const bridgeDetailsSchema = z.object({
  name: z.string().min(1, "Tên cầu không được để trống"),
  location: z.string(),
  coords: z.object({ lat: z.number(), lng: z.number() }).nullable(),
  sensorHeight: z.string(),
});

export const thresholdSchema = z
  .object({
    safeMax: z.number().finite(),
    warningMax: z.number().finite(),
  })
  .refine((v) => v.warningMax > v.safeMax, {
    message: "Ngưỡng cảnh báo phải lớn hơn ngưỡng an toàn",
    path: ["warningMax"],
  });

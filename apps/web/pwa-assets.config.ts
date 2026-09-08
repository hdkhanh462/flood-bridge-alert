import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// minimal2023Preset mặc định đệm (padding) 30% quanh logo cho icon
// maskable/apple-touch — bắt buộc phải có đệm để không bị OS cắt mất logo khi
// áp mask (tròn/vuông bo góc tuỳ launcher), nhưng 30% tạo viền trắng khá dày.
// Giảm còn 10%, đủ an toàn cho vùng mask chuẩn. Icon "transparent" (pwa-*.png)
// không đụng tới — vẫn sát mép, không viền.
const preset = {
  ...minimal2023Preset,
  maskable: { ...minimal2023Preset.maskable, padding: 0.1 },
  apple: { ...minimal2023Preset.apple, padding: 0.1 },
};

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset,
  images: ["public/logo.png"],
});

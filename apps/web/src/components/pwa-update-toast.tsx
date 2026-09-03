import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { usePwaStandalone } from "@/hooks/use-pwa-standalone";

export function PwaUpdateToast() {
  const isStandalone = usePwaStandalone();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh || !isStandalone) return;

    toast("Đã có bản cập nhật mới", {
      description: "Tải lại để sử dụng phiên bản mới nhất.",
      action: {
        label: "Tải lại",
        onClick: () => updateServiceWorker(true),
      },
      duration: Number.POSITIVE_INFINITY,
    });
  }, [needRefresh, isStandalone, updateServiceWorker]);

  return null;
}

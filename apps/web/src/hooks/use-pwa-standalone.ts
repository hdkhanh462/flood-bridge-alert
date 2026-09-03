import { useEffect, useState } from "react";

function getIsStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function usePwaStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(getIsStandalone);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = () => setIsStandalone(getIsStandalone());
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isStandalone;
}

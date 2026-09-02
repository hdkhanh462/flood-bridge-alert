import { Outlet } from "react-router";

import { ModeToggle } from "./mode-toggle";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Outlet />
    </div>
  );
}

import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@flood-bridge-alert/ui/components/sheet";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const LINKS = [
	{ to: "/", label: "Trang chủ" },
	{ to: "/bridges", label: "Cầu tràn" },
	{ to: "/guides/install", label: "Cài đặt" },
	{ to: "/guides/safety", label: "Hướng dẫn an toàn" },
] as const;

function NavLinks({
	onNavigate,
	className,
}: {
	onNavigate?: () => void;
	className?: string;
}) {
	return (
		<>
			{LINKS.map(({ to, label }) => (
				<NavLink
					key={to}
					to={to}
					end
					onClick={onNavigate}
					className={({ isActive }) =>
						`${className ?? ""} ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`
					}
				>
					{label}
				</NavLink>
			))}
		</>
	);
}

export default function Header() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
				<NavLink to="/" className="font-semibold text-lg">
					flood-bridge-alert
				</NavLink>

				<nav className="hidden items-center gap-6 text-sm md:flex">
					<NavLinks className="transition-colors hover:text-foreground" />
				</nav>

				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />

					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger
							render={
								<Button variant="outline" size="icon" className="md:hidden" />
							}
						>
							<MenuIcon className="h-4 w-4" />
							<span className="sr-only">Mở menu</span>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>Menu</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-4 px-4 text-base">
								<NavLinks onNavigate={() => setOpen(false)} />
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}

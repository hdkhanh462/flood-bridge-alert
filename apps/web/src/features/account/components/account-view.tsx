import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";

import { EmailCard } from "./email-card";
import { PasswordCard } from "./password-card";
import { ProfileCard } from "./profile-card";

export function AccountView() {
  useDocumentTitle("Quản lý tài khoản");
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  const isAnonymous = (session?.user as { isAnonymous?: boolean } | undefined)
    ?.isAnonymous;

  useEffect(() => {
    if (!isPending && (!session || isAnonymous)) navigate("/login");
  }, [session, isAnonymous, isPending, navigate]);

  if (isPending || !session || isAnonymous) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">
          Quản lý tài khoản
        </h1>
        <p className="text-muted-foreground text-sm">
          Cập nhật thông tin đăng nhập của tài khoản {session.user.email}
        </p>
      </div>
      <ProfileCard name={session.user.name} />
      <EmailCard email={session.user.email} />
      <PasswordCard />
    </div>
  );
}

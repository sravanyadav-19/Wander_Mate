import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  // Deprecated: use showBottomNav instead. Kept for backward compatibility.
  hideNavigation?: boolean;
}

export const AppLayout = ({ children, showBottomNav, hideNavigation }: AppLayoutProps) => {
  const shouldShowBottomNav = hideNavigation !== undefined
    ? !hideNavigation
    : showBottomNav !== undefined
      ? showBottomNav
      : true;

  return (
    <div className="min-h-screen bg-background">
      <main className={cn(
        "w-full",
        shouldShowBottomNav ? "pb-16" : ""
      )}>
        {children}
      </main>
      {shouldShowBottomNav && <BottomNavigation />}
    </div>
  );
};

import { cn } from "@/lib/utils";
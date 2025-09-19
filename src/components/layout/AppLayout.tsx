import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const AppLayout = ({ children, showBottomNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className={cn(
        "w-full",
        showBottomNav ? "pb-16" : ""
      )}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

import { cn } from "@/lib/utils";
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Home,
  Phone,
  MessageSquare,
  Wallet,
  Settings,
  User,
  BarChart3,
  CreditCard,
  Menu,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "My Numbers",
    href: "/numbers",
    icon: Phone,
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },

  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  className,
  isMobile = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-foreground">
              SMS Pool
            </h2>
            <div className="space-y-1">
              {navigation.map((item, index) => (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group"
                  asChild
                  onClick={isMobile ? onMobileClose : undefined}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <Link
                    href={item.href}
                    className="animate-in fade-in-0 slide-in-from-left-2"
                  >
                    <item.icon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span className="transition-all duration-200">
                      {item.name}
                    </span>
                    {item.name === "Messages" && (
                      <Badge
                        variant="destructive"
                        className="ml-auto transition-all duration-200 group-hover:scale-110 animate-pulse"
                      >
                        3
                      </Badge>
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="space-y-1">
              <div className="px-4 py-2 animate-in fade-in-0 slide-in-from-left-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground transition-colors duration-200">
                    Wallet Balance
                  </span>
                  <Badge
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105 hover:shadow-sm"
                  >
                    $0.00
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group"
                asChild
                onClick={isMobile ? onMobileClose : undefined}
              >
                <Link
                  href="/wallet/deposit"
                  className="animate-in fade-in-0 slide-in-from-left-2"
                >
                  <CreditCard className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <span className="transition-all duration-200">Add Funds</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return <SidebarContent />;
  }

  return <SidebarContent />;
}

// Mobile Sidebar Component
export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden transition-all duration-200 hover:bg-muted/50 hover:scale-105"
        >
          <Menu className="h-5 w-5 transition-transform duration-200" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] p-0 border-r-0 bg-background/95 backdrop-blur-sm"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="animate-in slide-in-from-left-2 duration-300">
          <Sidebar isMobile={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

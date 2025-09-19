"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Phone,
  MessageSquare,
  Wallet,
  Settings,
  User,
  BarChart3,
  CreditCard,
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
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-foreground">
              SMS Pool
            </h2>
            <div className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                    {item.name === "Messages" && (
                      <Badge variant="destructive" className="ml-auto">
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
              <div className="px-4 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Wallet Balance
                  </span>
                  <Badge variant="outline">$0.00</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/wallet/deposit">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Funds
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

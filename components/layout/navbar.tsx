"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileSidebar } from "@/components/layout/sidebar";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();

      // Listen for wallet updates
      const handleWalletUpdate = () => {
        fetchWalletBalance();
      };

      // Only add event listeners on client side
      if (typeof window !== "undefined") {
        window.addEventListener("walletUpdated", handleWalletUpdate);

        return () => {
          window.removeEventListener("walletUpdated", handleWalletUpdate);
        };
      }
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      setWalletBalance(profile?.wallet_balance || 0);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 border-b border-border backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            {/* Mobile Sidebar for authenticated users */}
            {user && <MobileSidebar />}
            <Link href="/" className="flex items-center space-x-3">
              {/* Get Any Number Online logo */}
              <div className="w-8 h-8 bg-card rounded-lg shadow-sm flex items-center justify-center border border-border">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-primary rounded-sm"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-sm"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-sm"></div>
                  <div className="w-2 h-2 bg-primary rounded-sm"></div>
                </div>
              </div>
              <span className="font-bold text-xl text-foreground">
                Get Any Number Online
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Balance: ${walletBalance.toFixed(2)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.email}
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/contact")}
                  className="hover:text-foreground"
                >
                  Contact
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="hover:text-foreground"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => router.push("/signup")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Get demo
                </Button>
              </div>
            )}

            {/* Mobile Menu Button - Only for non-authenticated users */}
            {!user && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:text-foreground transition-all duration-200 hover:scale-110 hover:bg-muted/50"
                onClick={toggleMobileMenu}
              >
                <div className="relative">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 transition-transform duration-200 rotate-180" />
                  ) : (
                    <Menu className="h-5 w-5 transition-transform duration-200" />
                  )}
                </div>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-4">
              {!user && (
                <>
                  <div className=" space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push("/contact");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full hover:bg-muted"
                    >
                      Contact
                    </Button>
                    <Button
                      // variant="ghost"
                      onClick={() => {
                        router.push("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-primary  hover:bg-primary/90 rounded-lg"
                    >
                      Sign in
                    </Button>
                    <Button
                      onClick={() => {
                        router.push("/signup");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-primary  hover:bg-primary/90 rounded-lg"
                    >
                      Get demo
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

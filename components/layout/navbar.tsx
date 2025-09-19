"use client";

import { useState } from "react";
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

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Link href="/" className="flex items-center space-x-3">
              {/* SMS Pool logo */}
              <div className="w-8 h-8 bg-card rounded-lg shadow-sm flex items-center justify-center border border-border">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-primary rounded-sm"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-sm"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-sm"></div>
                  <div className="w-2 h-2 bg-primary rounded-sm"></div>
                </div>
              </div>
              <span className="font-bold text-xl text-foreground">
                SMS Pool
              </span>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/numbers"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Numbers
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Messages
                </Link>
                <Link
                  href="/wallet"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wallet
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/features"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/solutions"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Solutions
                </Link>
                <Link
                  href="/resources"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resources
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Balance: $0.00
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
                  onClick={() => router.push("/login")}
                  className="text-muted-foreground hover:text-foreground"
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/numbers"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Numbers
                  </Link>
                  <Link
                    href="/messages"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    href="/wallet"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wallet
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/features"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/solutions"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Solutions
                  </Link>
                  <Link
                    href="/resources"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Resources
                  </Link>
                  <Link
                    href="/pricing"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <div className="pt-4 border-t border-border space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      Sign in
                    </Button>
                    <Button
                      onClick={() => {
                        router.push("/signup");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
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

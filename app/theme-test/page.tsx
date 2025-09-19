"use client";

import { Navbar } from "@/components/layout/navbar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Dark Mode Test Page
            </h1>
            <p className="text-lg text-muted-foreground">
              Test all components with dark mode support
            </p>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Primary Card</CardTitle>
                <CardDescription className="text-muted-foreground">
                  This card demonstrates the primary color scheme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-input" className="text-foreground">
                    Test Input
                  </Label>
                  <Input
                    id="test-input"
                    placeholder="Type something here..."
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="test-switch" />
                  <Label htmlFor="test-switch" className="text-foreground">
                    Toggle switch
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Primary Button
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Outline Button
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Secondary Card
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  This card shows secondary elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="default"
                    className="bg-primary text-primary-foreground"
                  >
                    Default
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground"
                  >
                    Secondary
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border text-foreground"
                  >
                    Outline
                  </Badge>
                  <Badge
                    variant="destructive"
                    className="bg-destructive text-destructive-foreground"
                  >
                    Destructive
                  </Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    This is a muted background area that adapts to the theme.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Color Palette</CardTitle>
              <CardDescription className="text-muted-foreground">
                All theme colors in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-16 bg-background border border-border rounded-lg"></div>
                  <p className="text-sm text-foreground">Background</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-card border border-border rounded-lg"></div>
                  <p className="text-sm text-foreground">Card</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-primary rounded-lg"></div>
                  <p className="text-sm text-foreground">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-secondary rounded-lg"></div>
                  <p className="text-sm text-foreground">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-muted rounded-lg"></div>
                  <p className="text-sm text-foreground">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-accent rounded-lg"></div>
                  <p className="text-sm text-foreground">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-destructive rounded-lg"></div>
                  <p className="text-sm text-foreground">Destructive</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 border-2 border-border rounded-lg"></div>
                  <p className="text-sm text-foreground">Border</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">How to Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Theme Toggle
                </h3>
                <p className="text-muted-foreground">
                  Click the theme toggle button in the navbar to switch between
                  light, dark, and system themes.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  System Theme
                </h3>
                <p className="text-muted-foreground">
                  When set to "System", the theme will automatically follow your
                  operating system's dark/light mode preference.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Persistence
                </h3>
                <p className="text-muted-foreground">
                  Your theme preference is saved in localStorage and will
                  persist across browser sessions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

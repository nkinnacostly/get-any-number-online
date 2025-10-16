"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Palette,
  Save,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: true,
    marketing_emails: false,
    two_factor_auth: false,
    auto_renewal: true,
    language: "en",
    timezone: "UTC",
    theme: "light",
    api_rate_limit: "100",
    webhook_url: "",
    data_retention_days: "30",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchSettings();
    }
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", (user as any)?.id)
        .single();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }

      if (settingsData) {
        setSettings(settingsData);
        setFormData({
          email_notifications: settingsData.email_notifications ?? true,
          sms_notifications: settingsData.sms_notifications ?? true,
          marketing_emails: settingsData.marketing_emails ?? false,
          two_factor_auth: settingsData.two_factor_auth ?? false,
          auto_renewal: settingsData.auto_renewal ?? true,
          language: settingsData.language || "en",
          timezone: settingsData.timezone || "UTC",
          theme: settingsData.theme || "light",
          api_rate_limit: settingsData.api_rate_limit || "100",
          webhook_url: settingsData.webhook_url || "",
          data_retention_days: settingsData.data_retention_days || "30",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const { error: upsertError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: (user as any)?.id,
          email_notifications: formData.email_notifications,
          sms_notifications: formData.sms_notifications,
          marketing_emails: formData.marketing_emails,
          two_factor_auth: formData.two_factor_auth,
          auto_renewal: formData.auto_renewal,
          language: formData.language,
          timezone: formData.timezone,
          theme: formData.theme,
          api_rate_limit: parseInt(formData.api_rate_limit),
          webhook_url: formData.webhook_url,
          data_retention_days: parseInt(formData.data_retention_days),
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      setSuccess("Settings saved successfully!");
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      email_notifications: true,
      sms_notifications: true,
      marketing_emails: false,
      two_factor_auth: false,
      auto_renewal: true,
      language: "en",
      timezone: "UTC",
      theme: "light",
      api_rate_limit: "100",
      webhook_url: "",
      data_retention_days: "30",
    });
    setError("");
    setSuccess("");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed left-0 top-0 h-screen w-[300px] bg-background border-r border-border z-10">
          <Sidebar className="h-full" />
        </div>

        {/* Main Content Area */}
        <div className="lg:ml-[300px]">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-[300px] bg-background border-r border-border z-10">
        <Sidebar className="h-full" />
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-[300px] transition-all duration-300 ease-in-out">
        <Navbar />
        <main className="p-4 md:p-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 md:h-6 md:w-6" />
                <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <Switch
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          email_notifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS notifications for urgent alerts
                      </p>
                    </div>
                    <Switch
                      checked={formData.sms_notifications}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, sms_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and product updates
                      </p>
                    </div>
                    <Switch
                      checked={formData.marketing_emails}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, marketing_emails: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={formData.two_factor_auth}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, two_factor_auth: checked })
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-0.5">
                      <Label>Auto-Renewal</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically renew numbers before expiration
                      </p>
                    </div>
                    <Switch
                      checked={formData.auto_renewal}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, auto_renewal: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) =>
                          setFormData({ ...formData, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="it">Italian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) =>
                          setFormData({ ...formData, timezone: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">
                            Eastern Time
                          </SelectItem>
                          <SelectItem value="America/Chicago">
                            Central Time
                          </SelectItem>
                          <SelectItem value="America/Denver">
                            Mountain Time
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            Pacific Time
                          </SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={formData.theme}
                        onValueChange={(value) =>
                          setFormData({ ...formData, theme: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* <div className="space-y-2">
                      <Label htmlFor="api_rate_limit">
                        API Rate Limit (per minute)
                      </Label>
                      <Input
                        id="api_rate_limit"
                        type="number"
                        value={formData.api_rate_limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            api_rate_limit: e.target.value,
                          })
                        }
                        placeholder="100"
                      />
                    </div> */}
                  </div>
                </CardContent>
              </Card>

              {/* Integration Settings */}
              {/* <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Integrations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">Webhook URL</Label>
                    <Input
                      id="webhook_url"
                      value={formData.webhook_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          webhook_url: e.target.value,
                        })
                      }
                      placeholder="https://your-domain.com/webhook"
                    />
                    <p className="text-sm text-muted-foreground">
                      Receive real-time notifications when messages are received
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_retention_days">
                      Data Retention (days)
                    </Label>
                    <Input
                      id="data_retention_days"
                      type="number"
                      value={formData.data_retention_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_retention_days: e.target.value,
                        })
                      }
                      placeholder="30"
                    />
                    <p className="text-sm text-muted-foreground">
                      How long to keep message data before automatic deletion
                    </p>
                  </div>
                </CardContent>
              </Card> */}

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="space-y-0.5">
                        <Label className="text-red-600">Delete Account</Label>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated
                          data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
} from "lucide-react";

interface UserInterface {
  id: string;
  email: string;
  created_at: string;
  full_name: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    bio: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", (user as any)?.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        full_name: profileData?.full_name || "",
        email: (user as any)?.email || "",
        phone: profileData?.phone || "",
        country: profileData?.country || "",
        bio: profileData?.bio || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          country: formData.country,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", (user as any)?.id);

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully!");
      setEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      email: (user as any)?.email || "",
      phone: profile?.phone || "",
      country: profile?.country || "",
      bio: profile?.bio || "",
    });
    setEditing(false);
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
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
                <User className="h-5 w-5 md:h-6 md:w-6" />
                <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
              </div>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="w-full md:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
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

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Overview */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="text-2xl">
                          {getInitials(
                            formData.full_name || (user as any)?.email || "U"
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl">
                      {formData.full_name || "No name set"}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {(user as any)?.email}
                    </p>
                    <div className="flex justify-center mt-2">
                      <Badge variant="outline">
                        {profile?.subscription_plan || "Free Plan"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Joined{" "}
                          {new Date(
                            (user as any)?.created_at || ""
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.country || "No location set"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        {editing ? (
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                full_name: e.target.value,
                              })
                            }
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {formData.full_name || "No name set"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {formData.email}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed here
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {editing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {formData.phone || "No phone number set"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        {editing ? (
                          <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                country: e.target.value,
                              })
                            }
                            placeholder="Enter your country"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {formData.country || "No country set"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {editing ? (
                        <textarea
                          id="bio"
                          className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md text-sm"
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {formData.bio || "No bio set"}
                        </p>
                      )}
                    </div>

                    {editing && (
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-4">
                        <Button
                          onClick={handleSave}
                          className="w-full sm:w-auto"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile?.total_numbers_purchased || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Numbers Purchased
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {profile?.total_messages_received || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Messages Received
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${profile?.total_spent || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {profile?.account_age_days || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Account Age (Days)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentNumbers } from "@/components/dashboard/recent-numbers";
import { ServicesGrid } from "@/components/numbers/services-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { SMSPoolService } from "@/services/sms-pool-api";
import {
  Phone,
  RefreshCw,
  Search,
  Bell,
  MessageSquare,
  Users,
} from "lucide-react";

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [myNumbers, setMyNumbers] = useState<any[]>([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchUserData();

      // Set up automatic status checking every 30 seconds
      const interval = setInterval(() => {
        fetchUserData();
      }, 30000); // 30 seconds

      // Listen for wallet updates
      const handleWalletUpdate = () => {
        fetchUserData();
      };

      // Only add event listeners on client side
      if (typeof window !== "undefined") {
        window.addEventListener("walletUpdated", handleWalletUpdate);

        return () => {
          clearInterval(interval);
          window.removeEventListener("walletUpdated", handleWalletUpdate);
        };
      }

      return () => {
        clearInterval(interval);
      };
    }
  }, [user, authLoading, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user?.id)
        .single();

      setWalletBalance(profile?.wallet_balance || 0);

      // Fetch user's purchased numbers
      const { data: numbers } = await supabase
        .from("purchased_numbers")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      // Check status for each number with SMS Pool
      const numbersWithStatus = await Promise.all(
        (numbers || []).map(async (number: any) => {
          if (number.smspool_number_id) {
            try {
              const smsService = new SMSPoolService(
                process.env.NEXT_PUBLIC_SMSPOOL_API_KEY || ""
              );
              const statusResult = await smsService.checkStatus(
                number.smspool_number_id
              );

              if (statusResult.success && statusResult.data) {
                // Update status based on SMS Pool response
                let newStatus = number.status;
                let newExpiryDate = number.expiry_date;

                // SMS Pool status codes:
                // 0 = Waiting for SMS
                // 1 = SMS received
                // 2 = Expired
                // 3 = SMS received (different format)
                // 4 = Cancelled
                // 5 = Refunded
                // 6 = Refunded (different format)
                // 7 = Waiting for resend
                // 8 = Resend cancelled

                switch (statusResult.data.status) {
                  case 0:
                  case 7:
                    newStatus = "active";
                    break;
                  case 1:
                  case 3:
                    newStatus = "completed";
                    break;
                  case 2:
                    newStatus = "expired";
                    break;
                  case 4:
                  case 8:
                    newStatus = "cancelled";
                    break;
                  case 5:
                  case 6:
                    newStatus = "refunded";
                    break;
                  default:
                    newStatus = "unknown";
                }

                // Calculate time left and expiry date
                if (statusResult.data.expiration) {
                  // Convert Unix timestamp to ISO string
                  newExpiryDate = new Date(
                    statusResult.data.expiration * 1000
                  ).toISOString();
                } else if (statusResult.data.expires_in) {
                  // expires_in is in seconds
                  const expiryDate = new Date();
                  expiryDate.setSeconds(
                    expiryDate.getSeconds() + statusResult.data.expires_in
                  );
                  newExpiryDate = expiryDate.toISOString();
                } else if (statusResult.data.time_left) {
                  // time_left is typically in minutes
                  const expiryDate = new Date();
                  expiryDate.setMinutes(
                    expiryDate.getMinutes() +
                      parseInt(statusResult.data.time_left)
                  );
                  newExpiryDate = expiryDate.toISOString();
                }

                // Update database if status changed
                if (
                  newStatus !== number.status ||
                  newExpiryDate !== number.expiry_date
                ) {
                  await supabase
                    .from("purchased_numbers")
                    .update({
                      status: newStatus,
                      expiry_date: newExpiryDate,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", number.id);
                }

                return {
                  ...number,
                  status: newStatus,
                  expiry_date: newExpiryDate,
                };
              }
            } catch (error) {
              console.error(
                `Error checking status for number ${number.smspool_number_id}:`,
                error
              );
            }
          }

          return number;
        })
      );

      setMyNumbers(numbersWithStatus);

      // Fetch available services
      const smsService = new SMSPoolService(
        process.env.NEXT_PUBLIC_SMSPOOL_API_KEY || ""
      );
      const availableServices = await smsService.getAvailableServices();
      setServices(availableServices.data || []);

      // Fetch recent messages
      if (numbers && numbers.length > 0) {
        const { data: recentMessages } = await supabase
          .from("received_messages")
          .select(
            `
            *,
            purchased_numbers (phone_number, service_name)
          `
          )
          .in(
            "number_id",
            numbers.map((n: any) => n.id)
          )
          .order("receive_date", { ascending: false })
          .limit(10);

        setMessages((recentMessages as any) || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const purchaseNumber = async (service: any) => {
    try {
      const smsService = new SMSPoolService(
        process.env.NEXT_PUBLIC_SMSPOOL_API_KEY || ""
      );
      const result = await smsService.purchaseNumber(
        service.service,
        service.country_code
      );

      if (result.success && result.data) {
        // Store purchase in database
        const { data: user } = await supabase.auth.getUser();

        const { error } = await supabase.from("purchased_numbers").insert({
          user_id: user.user?.id,
          phone_number: result.data.number,
          country_code: service.country_code,
          service_name: service.service,
          cost: service.cost,
          smspool_number_id: result.data.orderid,
          expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        if (error) throw error;

        // Refresh data
        await fetchUserData();
      } else {
        throw new Error(result.message || "Failed to purchase number");
      }
    } catch (error) {
      console.error("Error purchasing number:", error);
      throw error;
    }
  };

  const checkMessages = async (numberId: string) => {
    try {
      const number = myNumbers.find((n: any) => n.id === numberId) as any;
      if (!number) return;

      const smsService = new SMSPoolService(
        process.env.NEXT_PUBLIC_SMSPOOL_API_KEY || ""
      );
      const result = await smsService.checkMessages(number.smspool_number_id);

      if (result.success && result.data) {
        // Store messages in database
        const messages = Array.isArray(result.data)
          ? result.data
          : [result.data];
        for (const message of messages) {
          await supabase.from("received_messages").insert({
            number_id: numberId,
            sender: message.sender,
            message_text: message.message,
            receive_date: message.timestamp,
          });
        }

        // Refresh data
        await fetchUserData();
      }
    } catch (error) {
      console.error("Error checking messages:", error);
    }
  };

  const cancelNumber = async (numberId: string) => {
    try {
      const number = myNumbers.find((n: any) => n.id === numberId) as any;
      if (!number) return;

      const smsService = new SMSPoolService(
        process.env.NEXT_PUBLIC_SMSPOOL_API_KEY || ""
      );
      await smsService.cancelNumber(number.smspool_number_id);

      // Update status in database
      await supabase
        .from("purchased_numbers")
        .update({ status: "cancelled" })
        .eq("id", numberId);

      // Refresh data
      await fetchUserData();
    } catch (error) {
      console.error("Error cancelling number:", error);
    }
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
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const stats = {
    totalNumbers: myNumbers.length,
    activeNumbers: myNumbers.filter((n: any) => n.status === "active").length,
    totalMessages: messages.length,
    walletBalance: walletBalance,
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
        <main className="p-4 md:p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          {/* Header Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 space-y-4 md:space-y-0">
              <div className="animate-in fade-in-0 slide-in-from-left-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 transition-all duration-300">
                  Hello,{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                  !
                </h1>
                <p className="text-muted-foreground text-base md:text-lg transition-all duration-300">
                  Explore information and activity about your SMS numbers.
                </p>
              </div>
              <div
                className="flex items-center space-x-2 md:space-x-4 animate-in fade-in-0 slide-in-from-right-4"
                style={{ animationDelay: "200ms" }}
              >
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto transition-all duration-200 hover:border-primary/50 focus:scale-105"
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-in fade-in-0 slide-in-from-bottom-4">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 transition-colors duration-200">
                      Total Numbers
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-200 group-hover:text-primary">
                      {stats.totalNumbers}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: "100ms" }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 transition-colors duration-200">
                      Active Numbers
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-200 group-hover:text-primary">
                      {stats.activeNumbers}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: "200ms" }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 transition-colors duration-200">
                      Messages Received
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-200 group-hover:text-primary">
                      {stats.totalMessages}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages Section */}
          {messages.length > 0 && (
            <div className="mt-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    Recent Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.slice(0, 5).map((message: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-1 h-12 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium text-foreground">
                              Message from {message.sender || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(message.receive_date).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                              {message.message_text}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-primary text-sm font-medium">
                          <MessageSquare className="h-4 w-4 mr-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Numbers Section */}
          <div className="mt-8">
            <RecentNumbers
              numbers={myNumbers}
              onCheckMessages={checkMessages}
              onCancelNumber={cancelNumber}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Export with dynamic rendering to prevent prerendering issues
export default dynamic(() => Promise.resolve(DashboardPage), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  ),
});

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { PurchaseFlow } from "@/components/numbers/purchase-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { SMSPoolService } from "@/services/sms-pool-api";
import { Phone, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";

function NumbersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedNumber, setPurchasedNumber] = useState<any>(null);
  const [purchasedNumbers, setPurchasedNumbers] = useState<any[]>([]);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  // Fetch purchased numbers
  const fetchPurchasedNumbers = async () => {
    if (!user) return;

    setLoadingNumbers(true);
    try {
      const { data, error } = await supabase
        .from("purchased_numbers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching purchased numbers:", error);
        return;
      }

      // Check status for each number with SMS Pool
      const numbersWithStatus = await Promise.all(
        (data || []).map(async (number) => {
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
                let timeLeft = null;

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
                  const now = new Date();
                  const expiry = new Date(statusResult.data.expiration * 1000);
                  timeLeft = Math.max(
                    0,
                    Math.floor((expiry.getTime() - now.getTime()) / 1000 / 60)
                  ); // minutes
                } else if (statusResult.data.expires_in) {
                  // expires_in is in seconds
                  const expiryDate = new Date();
                  expiryDate.setSeconds(
                    expiryDate.getSeconds() + statusResult.data.expires_in
                  );
                  newExpiryDate = expiryDate.toISOString();
                  timeLeft = Math.floor(statusResult.data.expires_in / 60); // convert to minutes
                } else if (statusResult.data.time_left) {
                  // time_left is typically in minutes
                  const expiryDate = new Date();
                  expiryDate.setMinutes(
                    expiryDate.getMinutes() +
                      parseInt(statusResult.data.time_left)
                  );
                  newExpiryDate = expiryDate.toISOString();
                  timeLeft = parseInt(statusResult.data.time_left);
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
                  time_left: timeLeft,
                  smspool_status: statusResult.data.status,
                  smspool_message: statusResult.data.message,
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

      setPurchasedNumbers(numbersWithStatus);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching purchased numbers:", error);
    } finally {
      setLoadingNumbers(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPurchasedNumbers();

      // Set up automatic status checking every 30 seconds
      const interval = setInterval(() => {
        fetchPurchasedNumbers();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const handlePurchaseComplete = async (purchaseData?: any) => {
    console.log("Purchase completed successfully!", purchaseData);
    setPurchasedNumber(purchaseData);
    setShowSuccess(true);

    // Refresh purchased numbers list
    await fetchPurchasedNumbers();

    // Trigger a custom event to refresh wallet data in other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("walletUpdated"));
    }

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setPurchasedNumber(null);
    }, 5000);
  };

  // Helper function to get status badge
  const getStatusBadge = (
    status: string,
    expiryDate: string,
    timeLeft?: number
  ) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const isExpired = now > expiry;

    if (isExpired || status === "expired") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    if (status === "active") {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Active
        </Badge>
      );
    }

    if (status === "completed") {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200"
        >
          <CheckCircle className="h-3 w-3" />
          SMS Received
        </Badge>
      );
    }

    if (status === "cancelled") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    }

    if (status === "refunded") {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200"
        >
          <CheckCircle className="h-3 w-3" />
          Refunded
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // Helper function to format time remaining
  const getTimeRemaining = (expiryDate: string, timeLeft?: number) => {
    // Use timeLeft from SMS Pool if available, otherwise calculate from expiry date
    if (timeLeft !== null && timeLeft !== undefined) {
      if (timeLeft <= 0) {
        return "Expired";
      }

      const hours = Math.floor(timeLeft / 60);
      const minutes = timeLeft % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    }

    // Fallback to calculating from expiry date
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
      return "Expired";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (authLoading) {
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
              <p>Loading...</p>
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
        <main className="p-4 md:p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Purchase Numbers
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select a service, choose your country, and get a virtual number
                for SMS verification
              </p>
            </div>

            {showSuccess && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Purchase Successful!
                      </h3>
                      <p className="text-green-700">
                        Your SMS number has been purchased and added to your
                        account.
                        {purchasedNumber?.number && (
                          <span className="block mt-1 font-mono text-sm">
                            Number: {purchasedNumber.number}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <PurchaseFlow onPurchaseComplete={handlePurchaseComplete} />

            {/* Purchased Numbers Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Your Numbers
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchPurchasedNumbers}
                      disabled={loadingNumbers}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loadingNumbers ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    {lastUpdated && (
                      <span className="text-xs text-muted-foreground">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingNumbers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading numbers...</span>
                  </div>
                ) : purchasedNumbers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No numbers purchased yet</p>
                    <p className="text-sm">Purchase your first number above</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time Remaining</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Purchased</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchasedNumbers.map((number) => (
                            <TableRow key={number.id}>
                              <TableCell className="font-mono">
                                {number.phone_number}
                              </TableCell>
                              <TableCell>{number.country_code}</TableCell>
                              <TableCell>{number.service_name}</TableCell>
                              <TableCell>
                                {getStatusBadge(
                                  number.status,
                                  number.expiry_date,
                                  number.time_left
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {getTimeRemaining(
                                    number.expiry_date,
                                    number.time_left
                                  )}
                                </span>
                              </TableCell>
                              <TableCell>${number.cost.toFixed(2)}</TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(
                                    number.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {purchasedNumbers.map((number) => (
                        <Card key={number.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="font-mono text-lg font-semibold">
                                {number.phone_number}
                              </div>
                              {getStatusBadge(
                                number.status,
                                number.expiry_date,
                                number.time_left
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Country:
                                </span>
                                <div className="font-medium">
                                  {number.country_code}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Service:
                                </span>
                                <div className="font-medium">
                                  {number.service_name}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Cost:
                                </span>
                                <div className="font-medium">
                                  ${number.cost.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Time Left:
                                </span>
                                <div className="font-medium">
                                  {getTimeRemaining(
                                    number.expiry_date,
                                    number.time_left
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t">
                              <span className="text-muted-foreground text-sm">
                                Purchased:{" "}
                                {new Date(
                                  number.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

// Export with dynamic rendering to prevent prerendering issues
export default dynamic(() => Promise.resolve(NumbersPage), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading numbers...</p>
      </div>
    </div>
  ),
});

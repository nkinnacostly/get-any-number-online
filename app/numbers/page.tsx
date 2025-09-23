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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { SMSPoolService } from "@/services/sms-pool-api";
import { Phone, RefreshCw } from "lucide-react";

function NumbersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedNumber, setPurchasedNumber] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  const handlePurchaseComplete = async (purchaseData?: any) => {
    console.log("Purchase completed successfully!", purchaseData);
    setPurchasedNumber(purchaseData);
    setShowSuccess(true);

    // Trigger a custom event to refresh wallet data in other components
    window.dispatchEvent(new CustomEvent("walletUpdated"));

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setPurchasedNumber(null);
    }, 5000);
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

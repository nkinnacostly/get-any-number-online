"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { WalletCard } from "@/components/wallet/wallet-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Wallet, CreditCard, Minus, Plus } from "lucide-react";

export function WalletPageClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { formatNGN, convertUSDtoNGN } = useExchangeRate();

  const [balance, setBalance] = useState(0); // Stored in USD in DB
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchWalletData();
    }

    // Listen for wallet updates from other pages
    const handleWalletUpdate = () => {
      fetchWalletData();
    };

    // Listen for payment completion notifications
    const handlePaymentCompleted = (event: any) => {
      console.log("Payment completed:", event.detail);
      fetchWalletData();
      // Show success notification
      if (event.detail.amount) {
        // You can add a toast notification here
        console.log(
          `Payment of ₦${event.detail.amount} completed successfully!`
        );
      }
    };

    // Listen for payment failure notifications
    const handlePaymentFailed = (event: any) => {
      console.log("Payment failed:", event.detail);
      // Show failure notification
      if (event.detail.reason) {
        // You can add a toast notification here
        console.log(`Payment failed: ${event.detail.reason}`);
      }
    };

    // Only add event listeners on client side
    if (typeof window !== "undefined") {
      window.addEventListener("walletUpdated", handleWalletUpdate);
      window.addEventListener("paymentCompleted", handlePaymentCompleted);
      window.addEventListener("paymentFailed", handlePaymentFailed);

      return () => {
        window.removeEventListener("walletUpdated", handleWalletUpdate);
        window.removeEventListener("paymentCompleted", handlePaymentCompleted);
        window.removeEventListener("paymentFailed", handlePaymentFailed);
      };
    }
  }, [user, authLoading, router]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // Fetch user profile for wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user?.id)
        .single();

      setBalance(profile?.wallet_balance || 0);

      // Fetch transactions
      const { data: userTransactions } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setTransactions((userTransactions as any) || []);

      // Calculate statistics from transactions
      const userTransactionsArray = (userTransactions as any) || [];
      const deposited = userTransactionsArray
        .filter((t: any) => t.type === "deposit" && t.amount > 0)
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const spent = userTransactionsArray
        .filter(
          (t: any) =>
            t.type === "purchase" || (t.type === "withdrawal" && t.amount < 0)
        )
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      setTotalDeposited(deposited);
      setTotalSpent(spent);
      setTransactionCount(userTransactionsArray.length);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (amount: number) => {
    try {
      console.log("handleDeposit called with amount:", amount);
      // Just refresh the wallet data since PaystackFunding already handles the database operations
      await fetchWalletData();
      console.log("Wallet data refreshed");
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
      throw error;
    }
  };

  const handleWithdraw = async (amount: number) => {
    try {
      if (amount > balance) {
        throw new Error("Insufficient balance");
      }

      // Create transaction record
      const { error } = await supabase.from("transactions").insert({
        user_id: user?.id,
        type: "withdrawal",
        amount: -amount,
        description: "Wallet withdrawal",
        status: "completed",
      });

      if (error) throw error;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: balance - amount })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setBalance(balance - amount);
      await fetchWalletData();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      throw error;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "withdrawal":
        return <Minus className="h-4 w-4 text-red-600" />;
      case "purchase":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge variant="default">Deposit</Badge>;
      case "withdrawal":
        return <Badge variant="destructive">Withdrawal</Badge>;
      case "purchase":
        return <Badge variant="secondary">Purchase</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading wallet...</p>
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
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 md:h-6 md:w-6" />
              <h1 className="text-2xl md:text-3xl font-bold">Wallet</h1>
            </div>

            <WalletCard
              balance={balance}
              onDeposit={handleDeposit}
              userEmail={user?.email}
              userId={user?.id}
              totalDeposited={totalDeposited}
              totalSpent={totalSpent}
              transactionCount={transactionCount}
            />

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTransactionIcon(transaction.type)}
                              {getTransactionBadge(transaction.type)}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell
                            className={
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {formatNGN(
                              convertUSDtoNGN(Math.abs(transaction.amount))
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

// Import the client component dynamically with no SSR
const WalletPageClient = dynamic(
  () =>
    import("@/components/wallet/wallet-page-client").then((mod) => ({
      default: mod.WalletPageClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    ),
  }
);

export default function WalletPage() {
  return <WalletPageClient />;
}

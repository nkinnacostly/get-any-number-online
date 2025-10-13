"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";

export function ExchangeRateBanner() {
  const { rateDetails: rate, loading, error, refetch } = useExchangeRate();

  if (loading) {
    return (
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Loading exchange rate...
          </span>
        </div>
      </Card>
    );
  }

  if (error || !rate) {
    return (
      <Card className="p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-600 dark:text-red-400">
            Unable to load exchange rate
          </span>
          <button
            onClick={refetch}
            className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const formattedRate = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate.rate);

  return (
    <Card className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              USD to NGN:
            </span>
          </div>
          <span className="text-lg font-bold text-green-700 dark:text-green-400">
            ₦{formattedRate}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {rate.isStale && (
            <Badge
              variant="outline"
              className="text-xs border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400"
            >
              Stale ({Math.round(rate.hoursOld)}h old)
            </Badge>
          )}
          {!rate.isStale && rate.hoursOld < 1 && (
            <Badge
              variant="outline"
              className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-400"
            >
              Fresh
            </Badge>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated{" "}
            {rate.hoursOld < 1
              ? `${Math.round(rate.hoursOld * 60)}m ago`
              : `${Math.round(rate.hoursOld)}h ago`}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function CompactExchangeRateBadge() {
  const { rate } = useExchangeRate();

  if (!rate) {
    return null;
  }

  const formattedRate = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate);

  return (
    <Badge variant="outline" className="text-xs">
      $1 = ₦{formattedRate}
    </Badge>
  );
}

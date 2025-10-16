"use client";

import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriceDisplayProps {
  usdAmount: number;
  markupPercentage?: number;
  showUSD?: boolean;
  showMarkupBadge?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Displays price in NGN (converted from USD) with optional USD reference
 */
export function PriceDisplay({
  usdAmount,
  markupPercentage = 35,
  // showUSD = true,
  showMarkupBadge = false,
  className = "",
  size = "md",
}: PriceDisplayProps) {
  const { rate, loading, convertUSDtoNGN, formatNGN, formatUSD } =
    useExchangeRate();

  if (loading || !rate) {
    return <Skeleton className={`h-6 w-24 ${className}`} />;
  }

  const ngnAmount = convertUSDtoNGN(usdAmount, markupPercentage);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  // const subTextClasses = {
  //   sm: "text-xs",
  //   md: "text-sm",
  //   lg: "text-base",
  // };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <span
          className={`font-bold text-green-700 dark:text-green-400 ${sizeClasses[size]}`}
        >
          {formatNGN(ngnAmount)}
        </span>
        {showMarkupBadge && (
          <Badge variant="outline" className="text-xs">
            +{markupPercentage}%
          </Badge>
        )}
      </div>
      {/* {showUSD && (
        <span
          className={`text-gray-500 dark:text-gray-400 ${subTextClasses[size]}`}
        >
          {formatUSD(usdAmount)} USD
        </span>
      )} */}
    </div>
  );
}

interface PriceComparisonProps {
  usdAmount: number;
  markupPercentage?: number;
  className?: string;
}

/**
 * Shows a detailed price breakdown with markup explanation
 */
export function PriceComparison({
  usdAmount,
  markupPercentage = 35,
  className = "",
}: PriceComparisonProps) {
  const { rate, loading, convertUSDtoNGN, formatNGN, formatUSD } =
    useExchangeRate();

  if (loading || !rate) {
    return <Skeleton className={`h-32 w-full ${className}`} />;
  }

  const ngnWithoutMarkup = usdAmount * rate;
  const ngnWithMarkup = convertUSDtoNGN(usdAmount, markupPercentage);
  const markupAmount = ngnWithMarkup - ngnWithoutMarkup;

  return (
    <div className={`space-y-2 p-4 border rounded-lg bg-card ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Base Price (USD)
        </span>
        <span className="font-medium">{formatUSD(usdAmount)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-600 dark:text-gray-400">
            Exchange Rate
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Current USD to NGN exchange rate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="font-medium">₦{rate.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Service Markup ({markupPercentage}%)
        </span>
        <span className="font-medium text-orange-600 dark:text-orange-400">
          +{formatNGN(markupAmount)}
        </span>
      </div>

      <div className="border-t pt-2 mt-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">Total (NGN)</span>
          <span className="font-bold text-xl text-green-700 dark:text-green-400">
            {formatNGN(ngnWithMarkup)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CompactPriceProps {
  usdAmount: number;
  markupPercentage?: number;
  className?: string;
}

/**
 * Compact price display for tables and lists
 */
export function CompactPrice({
  usdAmount,
  markupPercentage = 35,
  className = "",
}: CompactPriceProps) {
  const { rate, loading, convertUSDtoNGN, formatNGN } = useExchangeRate();

  if (loading || !rate) {
    return <Skeleton className={`h-5 w-16 ${className}`} />;
  }

  const ngnAmount = convertUSDtoNGN(usdAmount, markupPercentage);

  return (
    <span
      className={`font-semibold text-green-700 dark:text-green-400 ${className}`}
    >
      {formatNGN(ngnAmount)}
    </span>
  );
}

interface PriceBadgeProps {
  usdAmount: number;
  markupPercentage?: number;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

/**
 * Price displayed as a badge
 */
export function PriceBadge({
  usdAmount,
  markupPercentage = 35,
  variant = "default",
  className = "",
}: PriceBadgeProps) {
  const { rate, loading, convertUSDtoNGN, formatNGN } = useExchangeRate();

  if (loading || !rate) {
    return <Skeleton className="h-6 w-20" />;
  }

  const ngnAmount = convertUSDtoNGN(usdAmount, markupPercentage);

  return (
    <Badge variant={variant} className={`font-semibold ${className}`}>
      {formatNGN(ngnAmount)}
    </Badge>
  );
}

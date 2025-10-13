import { NextResponse } from "next/server";
import { PriceCalculator } from "@/lib/price-calculator";

/**
 * POST /api/exchange-rate/calculate
 * Calculate prices with current exchange rate
 * Body: { usdAmount: number, markupPercentage?: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usdAmount, markupPercentage } = body;

    if (typeof usdAmount !== "number" || usdAmount < 0) {
      return NextResponse.json(
        { error: "Invalid USD amount" },
        { status: 400 }
      );
    }

    const conversion = await PriceCalculator.convertUSDtoNGN(
      usdAmount,
      markupPercentage
    );

    return NextResponse.json({
      success: true,
      conversion: {
        originalUSD: conversion.originalUSD,
        usdWithMarkup: conversion.usdWithMarkup,
        markupPercentage: conversion.markupPercentage,
        exchangeRate: conversion.exchangeRate,
        finalNGN: conversion.finalNGN,
        formattedUSD: PriceCalculator.formatUSD(conversion.originalUSD),
        formattedNGN: PriceCalculator.formatNGN(conversion.finalNGN),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/exchange-rate/calculate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate price" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/exchange-rate/calculate
 * Calculate prices with current exchange rate
 * Query params: usd, markup (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usdParam = searchParams.get("usd");
    const markupParam = searchParams.get("markup");

    if (!usdParam) {
      return NextResponse.json(
        { error: "Missing USD amount parameter" },
        { status: 400 }
      );
    }

    const usdAmount = parseFloat(usdParam);
    const markupPercentage = markupParam ? parseFloat(markupParam) : undefined;

    if (isNaN(usdAmount) || usdAmount < 0) {
      return NextResponse.json(
        { error: "Invalid USD amount" },
        { status: 400 }
      );
    }

    const conversion = await PriceCalculator.convertUSDtoNGN(
      usdAmount,
      markupPercentage
    );

    return NextResponse.json({
      success: true,
      conversion: {
        originalUSD: conversion.originalUSD,
        usdWithMarkup: conversion.usdWithMarkup,
        markupPercentage: conversion.markupPercentage,
        exchangeRate: conversion.exchangeRate,
        finalNGN: conversion.finalNGN,
        formattedUSD: PriceCalculator.formatUSD(conversion.originalUSD),
        formattedNGN: PriceCalculator.formatNGN(conversion.finalNGN),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/exchange-rate/calculate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate price" },
      { status: 500 }
    );
  }
}

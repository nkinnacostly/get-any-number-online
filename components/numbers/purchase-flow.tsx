"use client";

import { useState, useEffect } from "react";
import { ServiceSelection } from "./service-selection";
import { CountrySelection } from "./country-selection";
import { OrderConfirmation } from "./order-confirmation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SMSPoolService } from "@/services/sms-pool-api";
import { Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  name: string;
  icon?: string;
}

interface PricingOption {
  pool: number;
  price: number;
  originalPrice: number;
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  price: number;
  pricingOptions?: PricingOption[];
}

interface PurchaseFlowProps {
  onPurchaseComplete: (purchaseData?: any) => void;
}

type Step = "service" | "country" | "confirmation";

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  const flagMap: { [key: string]: string } = {
    US: "🇺🇸",
    GB: "🇬🇧",
    CA: "🇨🇦",
    AU: "🇦🇺",
    DE: "🇩🇪",
    FR: "🇫🇷",
    NG: "🇳🇬",
    GH: "🇬🇭",
    KE: "🇰🇪",
    ZA: "🇿🇦",
    NL: "🇳🇱",
    SE: "🇸🇪",
    NO: "🇳🇴",
    DK: "🇩🇰",
    FI: "🇫🇮",
    PL: "🇵🇱",
    IT: "🇮🇹",
    ES: "🇪🇸",
    PT: "🇵🇹",
    BE: "🇧🇪",
    CH: "🇨🇭",
    AT: "🇦🇹",
    IE: "🇮🇪",
    LU: "🇱🇺",
    CZ: "🇨🇿",
    HU: "🇭🇺",
    SK: "🇸🇰",
    SI: "🇸🇮",
    HR: "🇭🇷",
    BG: "🇧🇬",
    RO: "🇷🇴",
    GR: "🇬🇷",
    CY: "🇨🇾",
    MT: "🇲🇹",
    EE: "🇪🇪",
    LV: "🇱🇻",
    LT: "🇱🇹",
    RU: "🇷🇺",
    UA: "🇺🇦",
    BY: "🇧🇾",
    MD: "🇲🇩",
    RS: "🇷🇸",
    BA: "🇧🇦",
    ME: "🇲🇪",
    MK: "🇲🇰",
    AL: "🇦🇱",
    XK: "🇽🇰",
    TR: "🇹🇷",
    IL: "🇮🇱",
    AE: "🇦🇪",
    SA: "🇸🇦",
    QA: "🇶🇦",
    KW: "🇰🇼",
    BH: "🇧🇭",
    OM: "🇴🇲",
    JO: "🇯🇴",
    LB: "🇱🇧",
    SY: "🇸🇾",
    IQ: "🇮🇶",
    IR: "🇮🇷",
    AF: "🇦🇫",
    PK: "🇵🇰",
    IN: "🇮🇳",
    BD: "🇧🇩",
    LK: "🇱🇰",
    MV: "🇲🇻",
    NP: "🇳🇵",
    BT: "🇧🇹",
    MM: "🇲🇲",
    TH: "🇹🇭",
    LA: "🇱🇦",
    VN: "🇻🇳",
    KH: "🇰🇭",
    MY: "🇲🇾",
    SG: "🇸🇬",
    BN: "🇧🇳",
    ID: "🇮🇩",
    PH: "🇵🇭",
    TW: "🇹🇼",
    HK: "🇭🇰",
    MO: "🇲🇴",
    CN: "🇨🇳",
    JP: "🇯🇵",
    KR: "🇰🇷",
    MN: "🇲🇳",
    KZ: "🇰🇿",
    UZ: "🇺🇿",
    TJ: "🇹🇯",
    KG: "🇰🇬",
    TM: "🇹🇲",
    GE: "🇬🇪",
    AM: "🇦🇲",
    AZ: "🇦🇿",
    BR: "🇧🇷",
    AR: "🇦🇷",
    CL: "🇨🇱",
    PE: "🇵🇪",
    CO: "🇨🇴",
    VE: "🇻🇪",
    EC: "🇪🇨",
    BO: "🇧🇴",
    PY: "🇵🇾",
    UY: "🇺🇾",
    GY: "🇬🇾",
    SR: "🇸🇷",
    GF: "🇬🇫",
    MX: "🇲🇽",
    GT: "🇬🇹",
    BZ: "🇧🇿",
    SV: "🇸🇻",
    HN: "🇭🇳",
    NI: "🇳🇮",
    CR: "🇨🇷",
    PA: "🇵🇦",
    CU: "🇨🇺",
    JM: "🇯🇲",
    HT: "🇭🇹",
    DO: "🇩🇴",
    PR: "🇵🇷",
    TT: "🇹🇹",
    BB: "🇧🇧",
    GD: "🇬🇩",
    LC: "🇱🇨",
    VC: "🇻🇨",
    AG: "🇦🇬",
    KN: "🇰🇳",
    DM: "🇩🇲",
    MS: "🇲🇸",
    AI: "🇦🇮",
    VG: "🇻🇬",
    TC: "🇹🇨",
    BS: "🇧🇸",
    NZ: "🇳🇿",
    FJ: "🇫🇯",
    PG: "🇵🇬",
    SB: "🇸🇧",
    VU: "🇻🇺",
    NC: "🇳🇨",
    PF: "🇵🇫",
    WS: "🇼🇸",
    TO: "🇹🇴",
    KI: "🇰🇮",
    TV: "🇹🇻",
    NR: "🇳🇷",
    PW: "🇵🇼",
    FM: "🇫🇲",
    MH: "🇲🇭",
    EG: "🇪🇬",
    LY: "🇱🇾",
    TN: "🇹🇳",
    DZ: "🇩🇿",
    MA: "🇲🇦",
    SD: "🇸🇩",
    SS: "🇸🇸",
    ET: "🇪🇹",
    ER: "🇪🇷",
    DJ: "🇩🇯",
    SO: "🇸🇴",
    UG: "🇺🇬",
    RW: "🇷🇼",
    BI: "🇧🇮",
    TZ: "🇹🇿",
    MZ: "🇲🇿",
    MW: "🇲🇼",
    ZM: "🇿🇲",
    BW: "🇧🇼",
    NA: "🇳🇦",
    ZW: "🇿🇼",
    SZ: "🇸🇿",
    LS: "🇱🇸",
    MG: "🇲🇬",
    MU: "🇲🇺",
    SC: "🇸🇨",
    KM: "🇰🇲",
    YT: "🇾🇹",
    RE: "🇷🇪",
    AO: "🇦🇴",
    CD: "🇨🇩",
    CG: "🇨🇬",
    GA: "🇬🇦",
    GQ: "🇬🇶",
    ST: "🇸🇹",
    CV: "🇨🇻",
    GM: "🇬🇲",
    SN: "🇸🇳",
    ML: "🇲🇱",
    BF: "🇧🇫",
    NE: "🇳🇪",
    TD: "🇹🇩",
    CM: "🇨🇲",
    CF: "🇨🇫",
    LR: "🇱🇷",
    SL: "🇸🇱",
    GN: "🇬🇳",
    GW: "🇬🇼",
    CI: "🇨🇮",
    TG: "🇹🇬",
    BJ: "🇧🇯",
    MR: "🇲🇷",
  };
  return flagMap[countryCode] || "🌍";
}

// Helper function to get estimated price based on country
function getEstimatedPrice(countryCode: string): number {
  const priceMap: { [key: string]: number } = {
    US: 1.5,
    GB: 2.0,
    CA: 1.75,
    AU: 2.25,
    DE: 1.8,
    FR: 1.9,
    NG: 1.62,
    GH: 1.56,
    KE: 1.45,
    ZA: 1.7,
    NL: 1.85,
    SE: 2.1,
    NO: 2.15,
    DK: 2.05,
    FI: 1.95,
    PL: 1.75,
    IT: 1.85,
    ES: 1.8,
    PT: 1.7,
    BE: 1.9,
    CH: 2.2,
    AT: 1.95,
    IE: 1.85,
    LU: 2.0,
    CZ: 1.65,
    HU: 1.6,
    SK: 1.55,
    SI: 1.7,
    HR: 1.65,
    BG: 1.5,
    RO: 1.45,
    GR: 1.6,
    CY: 1.75,
    MT: 1.8,
    EE: 1.7,
    LV: 1.6,
    LT: 1.55,
    RU: 1.4,
    UA: 1.35,
    BY: 1.3,
    MD: 1.25,
    RS: 1.4,
    BA: 1.35,
    ME: 1.4,
    MK: 1.3,
    AL: 1.25,
    XK: 1.3,
    TR: 1.5,
    IL: 1.8,
    AE: 1.9,
    SA: 1.85,
    QA: 1.95,
    KW: 1.9,
    BH: 1.85,
    OM: 1.8,
    JO: 1.7,
    LB: 1.75,
    SY: 1.4,
    IQ: 1.35,
    IR: 1.3,
    AF: 1.25,
    PK: 1.2,
    IN: 1.15,
    BD: 1.1,
    LK: 1.25,
    MV: 1.4,
    NP: 1.2,
    BT: 1.3,
    MM: 1.15,
    TH: 1.25,
    LA: 1.2,
    VN: 1.3,
    KH: 1.25,
    MY: 1.35,
    SG: 1.6,
    BN: 1.5,
    ID: 1.2,
    PH: 1.25,
    TW: 1.4,
    HK: 1.55,
    MO: 1.5,
    CN: 1.3,
    JP: 1.7,
    KR: 1.65,
    MN: 1.25,
    KZ: 1.3,
    UZ: 1.2,
    TJ: 1.15,
    KG: 1.1,
    TM: 1.2,
    GE: 1.25,
    AM: 1.2,
    AZ: 1.25,
    BR: 1.4,
    AR: 1.35,
    CL: 1.45,
    PE: 1.3,
    CO: 1.25,
    VE: 1.2,
    EC: 1.25,
    BO: 1.2,
    PY: 1.25,
    UY: 1.3,
    GY: 1.35,
    SR: 1.3,
    GF: 1.4,
    MX: 1.35,
    GT: 1.25,
    BZ: 1.3,
    SV: 1.2,
    HN: 1.15,
    NI: 1.1,
    CR: 1.25,
    PA: 1.3,
    CU: 1.2,
    JM: 1.35,
    HT: 1.15,
    DO: 1.25,
    PR: 1.4,
    TT: 1.3,
    BB: 1.35,
    GD: 1.3,
    LC: 1.25,
    VC: 1.2,
    AG: 1.3,
    KN: 1.25,
    DM: 1.2,
    MS: 1.25,
    AI: 1.3,
    VG: 1.35,
    TC: 1.3,
    BS: 1.4,
    NZ: 1.8,
    FJ: 1.5,
    PG: 1.3,
    SB: 1.25,
    VU: 1.2,
    NC: 1.35,
    PF: 1.4,
    WS: 1.3,
    TO: 1.25,
    KI: 1.2,
    TV: 1.15,
    NR: 1.25,
    PW: 1.3,
    FM: 1.2,
    MH: 1.25,
    EG: 1.3,
    LY: 1.25,
    TN: 1.2,
    DZ: 1.25,
    MA: 1.3,
    SD: 1.2,
    SS: 1.15,
    ET: 1.1,
    ER: 1.15,
    DJ: 1.2,
    SO: 1.1,
    UG: 1.15,
    RW: 1.2,
    BI: 1.15,
    TZ: 1.25,
    MZ: 1.2,
    MW: 1.15,
    ZM: 1.2,
    BW: 1.25,
    NA: 1.3,
    ZW: 1.2,
    SZ: 1.25,
    LS: 1.2,
    MG: 1.15,
    MU: 1.3,
    SC: 1.35,
    KM: 1.2,
    YT: 1.25,
    RE: 1.3,
    AO: 1.2,
    CD: 1.15,
    CG: 1.2,
    GA: 1.25,
    GQ: 1.3,
    ST: 1.25,
    CV: 1.3,
    GM: 1.2,
    SN: 1.25,
    ML: 1.15,
    BF: 1.2,
    NE: 1.15,
    TD: 1.1,
    CM: 1.2,
    CF: 1.15,
    LR: 1.2,
    SL: 1.15,
    GN: 1.1,
    GW: 1.15,
    CI: 1.2,
    TG: 1.15,
    BJ: 1.2,
    MR: 1.25,
  };
  return priceMap[countryCode] || 1.5; // Default price
}

export function PurchaseFlow({ onPurchaseComplete }: PurchaseFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPricingOption, setSelectedPricingOption] =
    useState<PricingOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const smsService = new SMSPoolService(""); // No API key needed since we're using proxy
      const result = await smsService.getAvailableServices();

      if (result.success && result.data) {
        // Transform SMS Pool API response to our Service interface
        const transformedServices = result.data.map((service: any) => ({
          id: service.ID.toString(),
          name: service.name,
          icon: undefined, // SMS Pool doesn't provide icons
        }));
        setServices(transformedServices);
      } else {
        setError(result.error || "Failed to load services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async (serviceId: string) => {
    try {
      setLoading(true);
      setError("");

      const smsService = new SMSPoolService(""); // No API key needed since we're using proxy

      // Fetch countries and pricing data in parallel
      const [countriesResult, pricingResult] = await Promise.all([
        smsService.getAvailableCountries(),
        smsService.getPricing({ service: parseInt(serviceId) }),
      ]);

      if (countriesResult.success && countriesResult.data) {
        let pricingData: any[] = [];
        if (pricingResult.success && pricingResult.data) {
          pricingData = pricingResult.data;
        }

        // Transform SMS Pool API response to our Country interface
        const transformedCountries = countriesResult.data.map(
          (country: any) => {
            // Find all pricing options for this country and service
            const countryPricing = pricingData.filter(
              (pricing: any) =>
                pricing.country === country.ID &&
                pricing.service === parseInt(serviceId)
            );

            let pricingOptions: PricingOption[] = [];
            let fallbackPrice = getEstimatedPrice(country.short_name); // Fallback to estimated price

            if (countryPricing.length > 0) {
              // Create pricing options with 50% markup
              pricingOptions = countryPricing.map((pricing: any) => {
                const originalPrice = parseFloat(pricing.price);
                const markedUpPrice = originalPrice * 1.5; // Add 50% markup

                return {
                  pool: pricing.pool,
                  price: markedUpPrice,
                  originalPrice: originalPrice,
                };
              });

              // Sort by price (cheapest first)
              pricingOptions.sort((a, b) => a.price - b.price);

              // Use the cheapest marked-up price as the default
              fallbackPrice = pricingOptions[0].price;
            } else {
              // If no pricing data available, create a fallback option
              pricingOptions = [
                {
                  pool: 1, // Default pool
                  price: fallbackPrice * 1.5, // Add 50% markup to fallback
                  originalPrice: fallbackPrice,
                },
              ];
              fallbackPrice = pricingOptions[0].price;
            }

            return {
              id: country.ID.toString(),
              name: country.name,
              code: `+${country.cc}`,
              flag: getCountryFlag(country.short_name),
              price: fallbackPrice,
              pricingOptions: pricingOptions,
            };
          }
        );
        setCountries(transformedCountries);
      } else {
        setError(countriesResult.error || "Failed to load countries");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setError("Failed to load countries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    fetchCountries(service.id);
    setCurrentStep("country");
  };

  const handleCountrySelect = async (country: Country) => {
    setSelectedCountry(country);
    setSelectedPricingOption(null); // Reset pricing selection

    // Fetch real-time pricing for the selected country and service
    try {
      const smsService = new SMSPoolService(""); // No API key needed since we're using proxy

      const pricingResult = await smsService.getPricing({
        country: parseInt(country.id),
        service: parseInt(selectedService!.id),
      });

      if (
        pricingResult.success &&
        pricingResult.data &&
        pricingResult.data.length > 0
      ) {
        // Create pricing options with 50% markup
        const pricingOptions: PricingOption[] = pricingResult.data.map(
          (pricing: any) => {
            const originalPrice = parseFloat(pricing.price);
            const markedUpPrice = originalPrice * 1.5; // Add 50% markup

            return {
              pool: pricing.pool,
              price: markedUpPrice,
              originalPrice: originalPrice,
            };
          }
        );

        // Sort by price (cheapest first)
        pricingOptions.sort((a, b) => a.price - b.price);

        // Update the country with all pricing options
        setSelectedCountry({
          ...country,
          pricingOptions: pricingOptions,
          price: pricingOptions[0].price, // Use cheapest as default
        });
      }
    } catch (error) {
      console.error("Error fetching real-time pricing:", error);
      // Continue with the existing pricing options if API call fails
    }

    setCurrentStep("confirmation");
  };

  const handleBackToService = () => {
    setCurrentStep("service");
    setSelectedService(null);
    setSelectedCountry(null);
    setSelectedPricingOption(null);
  };

  const handleBackToCountry = () => {
    setCurrentStep("country");
    setSelectedCountry(null);
    setSelectedPricingOption(null);
  };

  const handlePricingOptionSelect = (pricingOption: PricingOption) => {
    setSelectedPricingOption(pricingOption);
  };

  const handleConfirmOrder = async () => {
    if (!selectedService || !selectedCountry) return;

    if (!user) {
      setError("You must be logged in to purchase a number");
      return;
    }

    // Use selected pricing option or default to cheapest
    const pricingOption =
      selectedPricingOption || selectedCountry.pricingOptions?.[0];
    if (!pricingOption) {
      setError("No pricing option available");
      return;
    }

    try {
      // Check wallet balance before attempting purchase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error("Unable to verify wallet balance");
      }

      const currentBalance = profile.wallet_balance || 0;
      const purchasePrice = pricingOption.price;

      if (currentBalance < purchasePrice) {
        setError(
          `Insufficient wallet balance. You have ₦${currentBalance.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }
          )} but need ₦${purchasePrice.toLocaleString("en-NG", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}. Please fund your wallet first.`
        );
        return;
      }

      const smsService = new SMSPoolService(""); // No API key needed since we're using proxy

      const result = await smsService.purchaseNumber(
        selectedService.id,
        selectedCountry.id,
        {
          pool: pricingOption.pool.toString(),
          max_price: pricingOption.price, // Use the selected price as max
          user_id: user.id,
          service_name: selectedService.name,
        }
      );

      console.log("Purchase result:", result);

      if (result.success && result.data) {
        // Handle successful purchase
        setSuccess(true);
        onPurchaseComplete(result.data);
        // Reset the flow after a delay
        setTimeout(() => {
          setCurrentStep("service");
          setSelectedService(null);
          setSelectedCountry(null);
          setSelectedPricingOption(null);
          setSuccess(false);
        }, 2000);
      } else {
        // Handle specific error cases
        if (result.error?.includes("Insufficient wallet balance")) {
          setError(
            "Insufficient wallet balance. Please fund your wallet first."
          );
        } else if (result.error?.includes("User profile not found")) {
          setError("Account error. Please try logging out and back in.");
        } else {
          setError(
            result.error || "Failed to purchase number. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error purchasing number:", error);
      if (
        error instanceof Error &&
        error.message.includes("Insufficient wallet balance")
      ) {
        setError(error.message);
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to purchase number. Please try again."
        );
      }
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✅ Purchase successful! Your SMS number has been purchased and added
            to your account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={fetchServices} className="flex-1">
            Retry
          </Button>
          {error.includes("Insufficient wallet balance") && (
            <Button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/wallet";
                }
              }}
              variant="outline"
              className="flex-1"
            >
              Fund Wallet
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Service Selection */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-card-foreground">
              Service
            </h2>
          </div>
          <div className="p-6">
            {currentStep === "service" ? (
              <ServiceSelection
                services={services}
                onServiceSelect={handleServiceSelect}
                loading={loading}
              />
            ) : selectedService ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {selectedService.icon ||
                      selectedService.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-card-foreground">
                    {selectedService.name}
                  </span>
                </div>
                <button
                  onClick={handleBackToService}
                  className="w-full text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Change Service
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-muted-foreground">1</span>
                </div>
                <p className="text-sm">Select a service to continue</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Country Selection */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-card-foreground">
              Country
            </h2>
          </div>
          <div className="p-6">
            {currentStep === "country" && selectedService ? (
              <CountrySelection
                countries={countries}
                selectedService={selectedService}
                onCountrySelect={handleCountrySelect}
                onBack={handleBackToService}
                loading={loading}
              />
            ) : selectedCountry ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-accent border border-accent rounded-xl">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-lg">
                    {selectedCountry.flag}
                  </div>
                  <div>
                    <div className="font-medium text-card-foreground">
                      {selectedCountry.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCountry.code}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleBackToCountry}
                  className="w-full text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Change Country
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-muted-foreground">2</span>
                </div>
                <p className="text-sm">Select a country to continue</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Order Confirmation */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-card-foreground">
              Order Summary
            </h2>
          </div>
          <div className="p-6">
            {currentStep === "confirmation" &&
            selectedService &&
            selectedCountry ? (
              <OrderConfirmation
                selectedService={selectedService}
                selectedCountry={selectedCountry}
                onBack={handleBackToCountry}
                onConfirm={handleConfirmOrder}
                onPricingOptionSelect={handlePricingOptionSelect}
                selectedPricingOption={selectedPricingOption}
                loading={loading}
              />
            ) : selectedService && selectedCountry ? (
              <div className="space-y-6">
                {/* Service */}
                <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {selectedService.icon ||
                        selectedService.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-card-foreground">
                      {selectedService.name}
                    </span>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">
                    Change
                  </button>
                </div>

                {/* Country */}
                <div className="flex items-center justify-between p-4 bg-accent border border-accent rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm">
                      {selectedCountry.flag}
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">
                        {selectedCountry.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedCountry.code}
                      </div>
                    </div>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">
                    Change
                  </button>
                </div>

                {/* Validity */}
                <div className="flex items-center space-x-3 p-4 bg-muted border border-border rounded-xl">
                  <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-background" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    Up to 20 minutes
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-card-foreground">
                      Total Cost
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    ${selectedCountry.price.toFixed(2)}
                  </span>
                </div>

                {/* Order Button */}
                <Button
                  onClick={() => setCurrentStep("confirmation")}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
                >
                  Order Number
                </Button>

                {/* Disclaimer */}
                <div className="text-center space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-primary">✓</span>
                    <span>Only successful activations are paid</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-primary">✓</span>
                    <span>No message - No payment</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-muted-foreground">3</span>
                </div>
                <p className="text-sm">Complete selections to see order</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

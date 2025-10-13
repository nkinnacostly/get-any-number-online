"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, SortAsc } from "lucide-react";
import { PriceDisplay } from "@/components/pricing/price-display";

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

interface CountrySelectionProps {
  countries: Country[];
  selectedService: Service;
  onCountrySelect: (country: Country) => void | Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export function CountrySelection({
  countries,
  selectedService,
  onCountrySelect,
  onBack,
  loading = false,
}: CountrySelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByPrice, setSortByPrice] = useState(false);

  // Filter countries based on search
  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort countries by price if requested
  const sortedCountries = sortByPrice
    ? [...filteredCountries].sort((a, b) => a.price - b.price)
    : filteredCountries;

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Search Bar Skeleton */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-muted rounded"></div>
          <div className="w-full h-10 bg-muted rounded-lg"></div>
        </div>

        {/* Sort Button Skeleton */}
        <div className="flex justify-end">
          <div className="w-20 h-8 bg-muted rounded"></div>
        </div>

        {/* Countries List Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-4 border border-border rounded-xl animate-pulse"
            >
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="w-12 h-4 bg-muted rounded"></div>
              <div className="w-4 h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>

      {/* Header with Sort */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          All Countries
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortByPrice(!sortByPrice)}
          className="text-muted-foreground hover:text-foreground"
        >
          Price
          <SortAsc className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Countries List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sortedCountries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">No countries found</div>
            <div className="text-xs mt-1">Try adjusting your search</div>
          </div>
        ) : (
          sortedCountries.map((country) => (
            <button
              key={country.id}
              onClick={() => onCountrySelect(country)}
              className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-accent hover:border-accent transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-lg">
                  {country.flag}
                </div>
                <div>
                  <div className="font-medium text-card-foreground group-hover:text-accent-foreground">
                    {country.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {country.code}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <PriceDisplay
                    usdAmount={country.price / 1.35}
                    markupPercentage={35}
                    showUSD={false}
                    size="sm"
                    className="items-end"
                  />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

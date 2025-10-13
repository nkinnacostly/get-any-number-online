"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PurchaseDialog } from "./purchase-dialog";
import { Search, Filter, Globe } from "lucide-react";
import { PriceDisplay } from "@/components/pricing/price-display";

interface Service {
  id: string;
  service: string;
  country: string;
  country_code: string;
  cost: number;
  is_active: boolean;
}

interface ServicesGridProps {
  services: Service[];
  onPurchase: (service: Service) => Promise<void>;
  loading?: boolean;
}

export function ServicesGrid({
  services,
  onPurchase,
  loading = false,
}: ServicesGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Ensure services is always an array
  const servicesArray = Array.isArray(services) ? services : [];

  // Get unique countries for filter
  const countries = Array.from(
    new Set(servicesArray.map((s) => s.country?.toLowerCase()).filter(Boolean))
  ).sort();

  // Filter services based on search and country
  const filteredServices = servicesArray.filter((service) => {
    const matchesSearch =
      service.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry =
      selectedCountry === "" ||
      service.country?.toLowerCase() === selectedCountry.toLowerCase();
    return matchesSearch && matchesCountry && service.is_active;
  });

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services or countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCountry?.toLowerCase()}
            onChange={(e) => setSelectedCountry(e.target.value.toLowerCase())}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option key="all-countries" value="">
              All Countries
            </option>
            {countries.map((country, index) => (
              <option key={`country-${country}-${index}`} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {service.service?.toLowerCase()}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-1 mt-1">
                      <Globe className="h-3 w-3" />
                      <span>{service.country?.toLowerCase()}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {service.country_code?.toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price</span>
                  <PriceDisplay
                    usdAmount={service.cost}
                    markupPercentage={0}
                    showUSD={true}
                    size="sm"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Valid for 24 hours from purchase
                </div>
                <PurchaseDialog service={service} onPurchase={onPurchase} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

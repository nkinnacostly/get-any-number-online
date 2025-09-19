"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  icon?: string;
}

interface ServiceSelectionProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
  loading?: boolean;
}

export function ServiceSelection({
  services,
  onServiceSelect,
  loading = false,
}: ServiceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter services based on search
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Search Bar Skeleton */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-muted rounded"></div>
          <div className="w-full h-10 bg-muted rounded-lg"></div>
        </div>

        {/* Services List Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-4 border border-border rounded-xl animate-pulse"
            >
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 h-4 bg-muted rounded"></div>
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
          placeholder="Search services..."
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

      {/* Services List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">No services found</div>
            <div className="text-xs mt-1">Try adjusting your search</div>
          </div>
        ) : (
          filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {service.icon || service.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-card-foreground group-hover:text-primary">
                  {service.name}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

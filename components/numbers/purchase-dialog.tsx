"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, DollarSign, Clock, CheckCircle } from "lucide-react";

interface Service {
  id: string;
  service: string;
  country: string;
  country_code: string;
  cost: number;
  is_active: boolean;
}

interface PurchaseDialogProps {
  service: Service;
  onPurchase: (service: Service) => Promise<void>;
}

export function PurchaseDialog({ service, onPurchase }: PurchaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePurchase = async () => {
    setLoading(true);
    setError("");

    try {
      await onPurchase(service);
      setOpen(false);
    } catch (err) {
      setError("Failed to purchase number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Phone className="mr-2 h-4 w-4" />
          Purchase Number
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Number</DialogTitle>
          <DialogDescription>
            Confirm your purchase for {service?.service} in {service?.country}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{service?.service}</CardTitle>
              <CardDescription>
                {service.country} ({service.country_code})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service</span>
                <Badge variant="outline">{service?.service}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Country</span>
                <span className="text-sm">{service?.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Duration</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">24 hours</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-medium">Total Cost</span>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold text-lg">
                    {service?.cost?.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Purchasing..." : "Confirm Purchase"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

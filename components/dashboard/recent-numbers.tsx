"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, MessageSquare, Trash2, RefreshCw } from "lucide-react";

interface Number {
  id: string;
  phone_number: string;
  country_code: string;
  service_name: string;
  status: string;
  expiry_date: string;
  cost: number;
}

interface RecentNumbersProps {
  numbers: Number[];
  onCheckMessages: (numberId: string) => void;
  onCancelNumber: (numberId: string) => void;
}

export function RecentNumbers({
  numbers,
  onCheckMessages,
  onCancelNumber,
}: RecentNumbersProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>Recent Numbers</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {numbers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No numbers purchased yet</p>
            <p className="text-sm">Purchase your first number to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {numbers.slice(0, 5).map((number) => (
                <TableRow key={number.id}>
                  <TableCell className="font-medium">
                    {number.phone_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{number.service_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {number.country_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(number.status)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(number.expiry_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCheckMessages(number.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCancelNumber(number.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

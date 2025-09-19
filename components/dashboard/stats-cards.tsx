"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, DollarSign, Clock } from "lucide-react";

interface StatsCardsProps {
  totalNumbers: number;
  activeNumbers: number;
  totalMessages: number;
  walletBalance: number;
}

export function StatsCards({
  totalNumbers,
  activeNumbers,
  totalMessages,
  walletBalance,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Numbers",
      value: totalNumbers,
      icon: Phone,
      description: "Numbers purchased",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Numbers",
      value: activeNumbers,
      icon: Clock,
      description: "Currently active",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Messages Received",
      value: totalMessages,
      icon: MessageSquare,
      description: "This month",
      trend: "+23%",
      trendUp: true,
    },
    {
      title: "Wallet Balance",
      value: `$${walletBalance.toFixed(2)}`,
      icon: DollarSign,
      description: "Available funds",
      trend: "-$5.20",
      trendUp: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{stat.description}</span>
              <Badge variant={stat.trendUp ? "default" : "secondary"}>
                {stat.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Search, RefreshCw, Phone, Clock } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  message_text: string;
  receive_date: string;
  is_read: boolean;
  purchased_numbers: {
    phone_number: string;
    service_name: string;
  };
}

interface MessagesListProps {
  messages: Message[];
  onRefresh: () => void;
  loading?: boolean;
}

export function MessagesList({
  messages,
  onRefresh,
  loading = false,
}: MessagesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");

  // Get unique phone numbers for filter
  const phoneNumbers = Array.from(
    new Set(messages.map((m) => m.purchased_numbers.phone_number))
  );

  // Filter messages based on search and phone number
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.message_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNumber =
      selectedNumber === "" ||
      message.purchased_numbers.phone_number === selectedNumber;
    return matchesSearch && matchesNumber;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Messages</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
        <Button onClick={onRefresh} disabled={loading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages or senders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={selectedNumber}
            onChange={(e) => setSelectedNumber(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Numbers</option>
            {phoneNumbers.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Received Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No messages found</h3>
              <p className="text-muted-foreground">
                {messages.length === 0
                  ? "No messages received yet. Purchase a number to start receiving SMS."
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow
                    key={message.id}
                    className={!message.is_read ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{message.purchased_numbers.phone_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {message.purchased_numbers.service_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.sender || (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={message.message_text}>
                        {message.message_text}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(message.receive_date).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.is_read ? (
                        <Badge variant="outline">Read</Badge>
                      ) : (
                        <Badge variant="default">Unread</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

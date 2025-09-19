"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MessagesList } from "@/components/messages/messages-list";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchMessages();
    }
  }, [user, authLoading, router]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const { data: recentMessages } = await supabase
        .from("received_messages")
        .select(
          `
          *,
          purchased_numbers (phone_number, service_name)
        `
        )
        .order("receive_date", { ascending: false });

      setMessages((recentMessages as any) || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed left-0 top-0 h-screen w-[300px] bg-background border-r border-border z-10">
          <Sidebar className="h-full" />
        </div>

        {/* Main Content Area */}
        <div className="lg:ml-[300px]">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-[300px] bg-background border-r border-border z-10">
        <Sidebar className="h-full" />
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-[300px] transition-all duration-300 ease-in-out">
        <Navbar />
        <main className="p-4 md:p-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <MessagesList
            messages={messages}
            onRefresh={fetchMessages}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
}

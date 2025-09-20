import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        // First check if user has any purchased numbers
        const { data: purchasedNumbers, error: numbersError } = await supabase
          .from("purchased_numbers")
          .select("id")
          .eq("user_id", user.id);

        if (numbersError) {
          console.error("Error fetching purchased numbers:", numbersError);
          setUnreadCount(0);
          setLoading(false);
          return;
        }

        // If no purchased numbers, no messages possible
        if (!purchasedNumbers || purchasedNumbers.length === 0) {
          setUnreadCount(0);
          setLoading(false);
          return;
        }

        // Get unread messages for user's purchased numbers
        const { data, error } = await supabase
          .from("received_messages")
          .select(
            `
            id,
            purchased_numbers!inner(user_id)
          `
          )
          .eq("is_read", false)
          .eq("purchased_numbers.user_id", user.id);

        if (error) {
          console.error("Error fetching unread messages:", error);
          setUnreadCount(0);
        } else {
          setUnreadCount(data?.length || 0);
        }
      } catch (err) {
        console.error("Unexpected error fetching unread messages:", err);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription to listen for new messages
    const channel = supabase
      .channel("unread_messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "received_messages",
        },
        () => {
          // Refetch count when messages change
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { unreadCount, loading };
};

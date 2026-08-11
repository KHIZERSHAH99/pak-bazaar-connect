
import { supabase } from '@/integrations/supabase/client';

type NotificationType = 
  | "role_change_request" 
  | "role_approved" 
  | "role_rejected";

/**
 * Sends a notification by calling the notifications edge function
 */
export const sendNotification = async (
  userId: string,
  type: NotificationType,
  metadata?: Record<string, any>
) => {
  try {
    const { data, error } = await supabase.functions.invoke("notifications", {
      body: { userId, type, metadata }
    });

    if (error) {
      console.error("Error sending notification:", error);
      return false;
    }

    console.log("Notification sent:", data);
    return true;
  } catch (error) {
    console.error("Error in sendNotification:", error);
    return false;
  }
};

/**
 * Helper to notify a user about their role change request
 */
export const notifyRoleChangeRequest = async (userId: string, requestedRole: string) => {
  return sendNotification(userId, "role_change_request", { requestedRole });
};

/**
 * Helper to notify a user about their role change approval
 */
export const notifyRoleApproved = async (userId: string, approvedRole: string) => {
  return sendNotification(userId, "role_approved", { approvedRole });
};

/**
 * Helper to notify a user about their role change rejection
 */
export const notifyRoleRejected = async (userId: string, requestedRole: string) => {
  return sendNotification(userId, "role_rejected", { requestedRole });
};

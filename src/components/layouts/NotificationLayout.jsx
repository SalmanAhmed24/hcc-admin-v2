"use client";

import { NotificationProvider } from "../contexts/NotificationContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function NotificationLayout({ children }) {
  const { userId } = useCurrentUser();

  return (
    <NotificationProvider userId={userId}>{children}</NotificationProvider>
  );
}

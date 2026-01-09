"use client";
import React, { createContext, useContext } from "react";
import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

const NotificationContext = createContext<NotificationInstance | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [api, contextHolder] = notification.useNotification();
  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const api = useContext(NotificationContext);
  if (!api)
    throw new Error("useNotify must be used within NotificationProvider");
  return api;
}

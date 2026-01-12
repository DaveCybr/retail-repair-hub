import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import React from "react";
import { Sidebar } from "./Sidebar";
import { MainLayout } from "./MainLayout";
import { PageHeader } from "./PageHeader";

interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <MainLayout>{children}</MainLayout>
      </div>
    </div>
  );
};

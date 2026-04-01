import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      {/*
        ProfileProvider sits inside AuthProvider so it can access
        useAuth() to know when the user is logged in and fetch their
        business profile automatically.
      */}
      <ProfileProvider>
        <Toaster position="top-center" richColors />
        <RouterProvider router={router} />
      </ProfileProvider>
    </AuthProvider>
  );
}

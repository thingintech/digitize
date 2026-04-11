import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { BusinessProvider } from "./context/BusinessContext";
import { ProfileProvider } from "./context/ProfileContext";
import { Toaster } from "sonner";
// import { LoadingSpinner } from "./components/ui";
import { DatabaseDebugger } from "./components/DatabaseDebugger";

function AppContent() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <DatabaseDebugger />
      <RouterProvider router={router} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BusinessProvider>
          <AppContent />
        </BusinessProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

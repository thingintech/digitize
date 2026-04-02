import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import { Toaster } from "sonner";
import { LoadingSpinner } from "./components/ui";
import { DatabaseDebugger } from "./components/DatabaseDebugger";

function AppContent() {
  const { isReady } = useProfile();

  // if (!isReady) {
  //   return (
  //     <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-50 text-center">
  //       <div>
  //         <div className="relative mb-6 inline-block">
  //           <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
  //           <LoadingSpinner className="relative scale-125" />
  //         </div>
  //         <h1 className="text-xl font-bold text-slate-900 tracking-tight">Digitize</h1>
  //         <p className="text-sm text-slate-500 mt-2 animate-pulse font-medium">Initializing your workspace...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <Toaster position="top-center" richColors />
      <DatabaseDebugger />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <RouterProvider router={router} />
        <AppContent />
      </ProfileProvider>
    </AuthProvider>
  );
}

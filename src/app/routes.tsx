import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardOverview } from "./pages/DashboardOverview";
import { MenuManagement } from "./pages/MenuManagement";
import { QRCodes } from "./pages/QRCodes";
import { MapsSetup } from "./pages/MapsSetup";
import { Analytics } from "./pages/Analytics";
import { PublicMenu } from "./pages/PublicMenu";

// Auth Components
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ServiceSelection } from "./pages/auth/ServiceSelection";

// Dashboard Pages
import { Billing } from "./pages/dashboard/Billing";
import { Settings } from "./pages/dashboard/Settings";
import { Support } from "./pages/dashboard/Support";

// Admin Pages
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminBusinesses } from "./pages/admin/AdminBusinesses";
import { AdminSubscriptions } from "./pages/admin/AdminSubscriptions";

import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/pricing",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />, // Protect the entire section
    children: [
      { path: "selection", Component: ServiceSelection },
      {
        element: <DashboardLayout />,
        children: [
          { index: true, Component: DashboardOverview },
          { path: "menu", Component: MenuManagement },
          { path: "qr", Component: QRCodes },
          { path: "integrations", Component: MapsSetup },
          { path: "analytics", Component: Analytics },
          { path: "billing", Component: Billing },
          { path: "settings", Component: Settings },
          { path: "support", Component: Support },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute />, // Admin should be even more protected, but for now this is ok
    children: [
      {
        index: true,
        Component: AdminOverview,
      },
      {
        path: "businesses",
        Component: AdminBusinesses,
      },
      {
        path: "subscriptions",
        Component: AdminSubscriptions,
      },
    ],
  },
  {
    path: "/:businessSlug",
    Component: PublicMenu,
  },
]);


import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { HomePage } from "./routes/HomePage";
import { NewBusinessPage } from "./routes/NewBusinessPage";
import { BusinessProfilePage } from "./routes/BusinessProfilePage";
import { LoginPage } from "./routes/LoginPage";
import { RegisterPage } from "./routes/RegisterPage";
import { TransactionsPage } from "./routes/TransactionsPage";

import RequireAuth from "./features/auth/RequireAuth";
import { AppLayout } from "./components/layout/AppLayout";
import { BusinessesPage } from "./routes/BusinessesPage";
import { AIAssistantPage } from "./routes/AIAssistantPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <RequireAuth>
      <AppLayout>
        <HomePage />
      </AppLayout>
    </RequireAuth>
  ),
});

const newBusinessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/businesses/new",
  component: () => (
    <RequireAuth>
      <AppLayout>
        <NewBusinessPage />
      </AppLayout>
    </RequireAuth>
  ),
});

const businessProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/businesses/$businessId",
  component: () => (
    <RequireAuth>
      <AppLayout>
        <BusinessProfilePage />
      </AppLayout>
    </RequireAuth>
  ),
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transactions",
  component: () => (
    <RequireAuth>
      <AppLayout>
        <TransactionsPage />
      </AppLayout>
    </RequireAuth>
  ),
});

const aiAssistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-assistant",
  component: () => (
    <RequireAuth>
      <AppLayout>
        <AIAssistantPage />
      </AppLayout>
    </RequireAuth>
  ),
});

const businessesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/businesses",
  component: () => (
    <RequireAuth>
      <AppLayout>
        <BusinessesPage />
      </AppLayout>
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  homeRoute,
  businessesRoute,
  newBusinessRoute,
  businessProfileRoute,
  transactionsRoute,
  aiAssistantRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
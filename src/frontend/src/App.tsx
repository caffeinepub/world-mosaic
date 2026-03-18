import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { JoinBanner } from "./components/JoinBanner";
import { Navbar } from "./components/Navbar";
import { About } from "./pages/About";
import { Admin } from "./pages/Admin";
import { Browse } from "./pages/Browse";
import { Contact } from "./pages/Contact";
import { Countries } from "./pages/Countries";
import { Home } from "./pages/Home";
import { ProfileDetail } from "./pages/ProfileDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <JoinBanner />
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse",
  component: Browse,
});

const countriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/countries",
  component: Countries,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$id",
  component: ProfileDetail,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: Contact,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  browseRoute,
  countriesRoute,
  profileRoute,
  aboutRoute,
  contactRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

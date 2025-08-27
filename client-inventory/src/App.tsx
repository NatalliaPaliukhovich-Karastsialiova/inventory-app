import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import InventoriesPage from "./pages/InventoriesPage";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import {
  AuthRedirectRoute,
  AuthRedirectAdminRoute,
  NonAuthRedirectRoute
} from "./components/AuthRedirectRoute";
import InventoryDetailsPage from "./pages/InventoryDetailsPage";
import ItemPage from "./pages/ItemPage";
import SearchPage from "./pages/SearchPage";
import { useCodeListsStore } from "@/store/codeListsStore";
import { useEffect } from "react";

export default function App() {
  const fetchCodeLists = useCodeListsStore((s) => s.fetchCodeLists);

  useEffect(() => {
    fetchCodeLists();
  }, [fetchCodeLists]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Toaster
          expand={true}
          richColors
          position="bottom-right"
          duration={3000}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <AuthRedirectRoute>
                <LoginPage />
              </AuthRedirectRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirectRoute>
                <RegisterPage />
              </AuthRedirectRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <NonAuthRedirectRoute>
                <ProfilePage />
              </NonAuthRedirectRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthRedirectAdminRoute>
                <AdminPage />
              </AuthRedirectAdminRoute>
            }
          />
          <Route path="/inventories" element={<InventoriesPage />} />
          <Route path="/inventories/:id" element={<InventoryDetailsPage />} />
          <Route
            path="/inventories/new"
            element={
              <NonAuthRedirectRoute>
                <InventoryDetailsPage />
              </NonAuthRedirectRoute>
            }
          />
          <Route
            path="/inventories/:id/items/new"
            element={
              <NonAuthRedirectRoute>
                <ItemPage />
              </NonAuthRedirectRoute>
            }
          />
          <Route path="/inventories/:id/items/:itemId" element={<ItemPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

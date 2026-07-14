import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Revenue from "./pages/Revenue";
import Settings from "./pages/Settings";

const titles = {
  "/": "Dashboard",
  "/inventory": "Inventory",
  "/orders": "Orders",
  "/customers": "Customers",
  "/invoices": "Invoices",
  "/reports": "Reports",
  "/revenue": "Revenue",
  "/settings": "Settings",
};

function ProtectedPage({ path, children }) {
  return (
    <ProtectedRoute>
      <Layout title={titles[path]}>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedPage path="/"><Dashboard /></ProtectedPage>} />
          <Route path="/inventory" element={<ProtectedPage path="/inventory"><Inventory /></ProtectedPage>} />
          <Route path="/orders" element={<ProtectedPage path="/orders"><Orders /></ProtectedPage>} />
          <Route path="/customers" element={<ProtectedPage path="/customers"><Customers /></ProtectedPage>} />
          <Route path="/invoices" element={<ProtectedPage path="/invoices"><Invoices /></ProtectedPage>} />
          <Route path="/reports" element={<ProtectedPage path="/reports"><Reports /></ProtectedPage>} />
          <Route path="/revenue" element={<ProtectedPage path="/revenue"><Revenue /></ProtectedPage>} />
          <Route path="/settings" element={<ProtectedPage path="/settings"><Settings /></ProtectedPage>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

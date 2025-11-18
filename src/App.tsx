import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const App = () => {

  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div style={{ position: "relative" }}>
          <Button
            style={{ position: "absolute", top: 16, right: 16, zIndex: 1000 }}
            onClick={() => setShowLogin(true)}
          >
            Admin Login
          </Button>
          <Dialog open={showLogin} onOpenChange={setShowLogin}>
            {!isAdmin && (
              <AdminLogin
                onSuccess={() => {
                  setIsAdmin(true);
                  setShowLogin(false);
                }}
              />
            )}
          </Dialog>
        </div>
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/funder-fleet-manager" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

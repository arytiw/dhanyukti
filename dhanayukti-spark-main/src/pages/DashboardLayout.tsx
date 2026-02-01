import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/api";
import { useAuthContext } from "@/context/AuthContext";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout } = useAuthContext();

  // Fetch user profile for header greeting
  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await getUserProfile();
      return res.data;
    },
    // avoid refetching too aggressively from header
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (profileQuery.error) {
      const err = profileQuery.error as any;
      if (err?.message === "AUTH_EXPIRED") logout();
    }
  }, [profileQuery.error, logout]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 backdrop-blur-xl bg-background/80 border-b border-border flex items-center justify-between px-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-10 bg-secondary border-0"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            
            <Link to="/dashboard/account" className="flex items-center gap-3 hover:bg-secondary/50 rounded-lg p-2 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">
                  {profileQuery.data?.firstName ? `Welcome ${profileQuery.data.firstName}!` : "Welcome!"}
                </p>
                <p className="text-xs text-muted-foreground">{profileQuery.data?.username ?? "User"}</p>
              </div>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;

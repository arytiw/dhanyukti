import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  Calculator, 
  FileText, 
  User, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", url: "/dashboard/expenses", icon: Receipt },
  { title: "Investments", url: "/dashboard/investments", icon: TrendingUp },
  { title: "Wallet & Trading", url: "/dashboard/stonks", icon: Wallet },
  { title: "Tax Profile", url: "/dashboard/tax", icon: Calculator },
  { title: "Reports", url: "/dashboard/reports", icon: FileText },
  { title: "My Account", url: "/dashboard/account", icon: User },
  { title: "Help", url: "/dashboard/help", icon: HelpCircle },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const { logout } = useAuthContext();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">Dhanyukti</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center mx-auto">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sidebar-foreground/70 transition-all duration-200 group",
              "hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.title}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>
      
      {/* Toggle & Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

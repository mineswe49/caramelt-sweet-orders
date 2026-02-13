"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BRAND_NAME } from "@/lib/constants";
import { LayoutDashboard, ShoppingBag, LogOut, Menu, X, Package } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      href: "/admin/dashboard/all-orders",
      icon: Package,
    },
  ];

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Match Orders for both /all-orders and /orders routes
    if (href === "/admin/dashboard/all-orders") {
      return (
        pathname.startsWith(href + "/") ||
        pathname.startsWith("/admin/dashboard/orders/")
      );
    }
    // Only match sub-pages for non-dashboard links
    if (href !== "/admin/dashboard" && pathname.startsWith(href + "/")) {
      return true;
    }
    return false;
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-center">
        <Image
          src="/caramelt-logo.png"
          alt="Caramelt Logo"
          width={120}
          height={50}
          priority
          className="h-12 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-gray-700 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              aria-hidden="true"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 w-64 h-screen z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

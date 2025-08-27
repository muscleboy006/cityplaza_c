import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon, Search as SearchIcon, X as XIcon, BarChart3, FileText, Zap, Droplets, Flame, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

const MainLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen">
      {/* ✅ Header */}
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <button
          className="p-2 rounded-md hover:bg-primary/30 transition"
          onClick={() => setDrawerOpen(true)}
          aria-label="Открыть меню"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </header>

      {/* ✅ Drawer (Sidebar) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>Меню</SheetTitle>
          </SheetHeader>
          <div className="space-y-1 px-2">
            <button
              onClick={() => {
                navigate("/dashboard");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Дашборд
            </button>
            <button
              onClick={() => {
                navigate("/cons");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <FileText className="w-5 h-5 mr-2" />
              Договоры
            </button>
            <button
              onClick={() => {
                navigate("/archcons");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <FileText className="w-5 h-5 mr-2" />
              Архивные договоры
            </button>
            <button
              onClick={() => {
                navigate("/elec");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Zap className="w-5 h-5 mr-2" />
              Электричество
            </button>
            <button
              onClick={() => {
                navigate("/suv");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Droplets className="w-5 h-5 mr-2" />
              Вода
            </button>
            <button
              onClick={() => {
                navigate("/gas");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Flame className="w-5 h-5 mr-2" />
              Газ
            </button>
            <button
              onClick={() => {
                navigate("/tax");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Налог
            </button>
            <button
              onClick={() => {
                navigate("/man");
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Управляюшие компании
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ✅ Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

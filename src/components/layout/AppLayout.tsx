import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useTranslation } from "@/hooks/useTranslation";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { language } = useTranslation();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <Backdrop />
      <div className={`w-full transition-all duration-300 ease-in-out ${isRTL
          ? (isExpanded || isHovered ? "lg:pr-[290px]" : "lg:pr-[90px]")
          : (isExpanded || isHovered ? "lg:pl-[290px]" : "lg:pl-[90px]")
        } ${isMobileOpen ? "pl-0 pr-0" : ""}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;

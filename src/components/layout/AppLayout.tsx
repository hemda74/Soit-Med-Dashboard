import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import { useTranslation } from "@/hooks/useTranslation";

const AppLayout: React.FC = () => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className={`w-full transition-all duration-300 ease-in-out ${isRTL
        ? "lg:pr-[290px]"
        : "lg:pl-[290px]"
        }`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
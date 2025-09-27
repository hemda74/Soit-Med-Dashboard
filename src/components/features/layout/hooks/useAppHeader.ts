import { useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';

export const useAppHeader = () => {
	const {
		isMobileOpen: isSidebarOpen,
		toggleMobileSidebar: toggleSidebar,
	} = useSidebar();
	const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

	const toggleAppMenu = () => {
		setIsAppMenuOpen(!isAppMenuOpen);
	};

	return {
		isSidebarOpen,
		toggleSidebar,
		isAppMenuOpen,
		toggleAppMenu,
	};
};

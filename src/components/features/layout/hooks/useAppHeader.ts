import { useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';

export const useAppHeader = () => {
	const {
		toggleSidebar: toggleDesktopSidebar,
		toggleMobileSidebar,
		isExpanded,
	} = useSidebar();
	const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

	const toggleAppMenu = () => {
		setIsAppMenuOpen(!isAppMenuOpen);
	};

	const handleToggle = () => {
		if (window.innerWidth >= 1024) {
			toggleDesktopSidebar();
		} else {
			toggleMobileSidebar();
		}
	};

	return {
		toggleSidebar: handleToggle,
		isAppMenuOpen,
		toggleAppMenu,
		isExpanded,
	};
};

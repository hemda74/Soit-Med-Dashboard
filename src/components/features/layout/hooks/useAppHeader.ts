import { useState } from 'react';

export const useAppHeader = () => {
	const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

	const toggleAppMenu = () => {
		setIsAppMenuOpen(!isAppMenuOpen);
	};

	return {
		isAppMenuOpen,
		toggleAppMenu,
	};
};

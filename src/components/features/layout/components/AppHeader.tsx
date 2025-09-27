import React from 'react';
import { AppHeaderUI } from './AppHeaderUI';
import { useAppHeader } from '../hooks/useAppHeader';

export const AppHeader: React.FC = () => {
    const { toggleSidebar, isAppMenuOpen, toggleAppMenu, isExpanded } = useAppHeader();

    return (
        <AppHeaderUI
            toggleSidebar={toggleSidebar}
            isAppMenuOpen={isAppMenuOpen}
            toggleAppMenu={toggleAppMenu}
            isExpanded={isExpanded}
        />
    );
};

export default AppHeader;

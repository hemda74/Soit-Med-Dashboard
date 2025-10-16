import React from 'react';
import { AppHeaderUI } from './AppHeaderUI';
import { useAppHeader } from '../hooks/useAppHeader';

export const AppHeader: React.FC = () => {
    const { isAppMenuOpen, toggleAppMenu } = useAppHeader();

    return (
        <AppHeaderUI
            isAppMenuOpen={isAppMenuOpen}
            toggleAppMenu={toggleAppMenu}
        />
    );
};

export default AppHeader;

import React from 'react';
import { AppHeaderUI } from './AppHeaderUI';
import { useAppHeader } from '../hooks/useAppHeader';

export const AppHeader: React.FC = () => {
    const appHeaderProps = useAppHeader();

    return <AppHeaderUI {...appHeaderProps} />;
};

export default AppHeader;

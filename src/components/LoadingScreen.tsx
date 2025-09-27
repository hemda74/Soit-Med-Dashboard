import { useAppStore } from '@/stores/appStore';
import { LoadingSpinner } from '@/components/shared';

export function LoadingScreen() {
    const { loading } = useAppStore();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <LoadingSpinner
                size="lg"
                text="Loading..."
                className="space-y-4"
            />
        </div>
    );
}

export default LoadingScreen;

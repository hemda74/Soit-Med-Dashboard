import { useAppStore } from '@/stores/appStore';

export function LoadingScreen() {
    const { loading } = useAppStore();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <img
                        src="/src/assets/Logo Loader.gif"
                        alt="Loading..."
                        className="h-48 w-48"
                        onError={(e) => {
                            // Fallback if the gif doesn't load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;

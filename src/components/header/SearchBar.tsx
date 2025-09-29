import React, { useRef, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                className="pl-10 pr-20 h-10 w-full max-w-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs text-muted-foreground">
                <Command className="h-3 w-3" />
                <span>K</span>
            </div>
        </div>
    );
};

export default SearchBar;


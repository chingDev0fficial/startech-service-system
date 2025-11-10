import { Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    // Always light mode - no toggle needed
    return (
        <div className={className} {...props}>
            <div className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground">
                <Sun className="h-5 w-5" />
                <span className="sr-only">Light theme</span>
            </div>
        </div>
    );
}

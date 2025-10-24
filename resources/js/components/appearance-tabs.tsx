import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const effectiveAppearance = appearance || 'light'; // Default to 'light' if appearance is not set

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div 
            className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800', className)} 
            role="tablist"
            aria-label="Appearance settings"
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    role="tab"
                    aria-selected={effectiveAppearance === value}
                    aria-label={`${label} mode`}
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500',
                        effectiveAppearance === value
                            ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-100',
                    )}
                >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}

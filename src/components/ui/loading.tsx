import { cn } from '@/lib/utils';
import { LumaSpin } from '@/components/ui/luma-spin';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  return <LumaSpin size={size} className={className} />;
};

interface LoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = ({
  message = 'Loading',
  className = '',
  size = 'md',
}: LoadingProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
      <Spinner size={size} />
      {message && (
        <div className="text-center space-y-1">
          <p className="font-display text-2xl text-foreground">{message}</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Please wait
          </p>
        </div>
      )}
    </div>
  );
};

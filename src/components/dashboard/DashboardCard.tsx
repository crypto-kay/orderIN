import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ title, value, icon, subtitle, className }, ref) => {
    return (
      <Card ref={ref} className={cn('transition-shadow hover:shadow-md', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {icon}
          <div className="grid gap-1">
            <h1 className="text-[22px] font-bold tracking-tight leading-[26px]">{title}</h1>
            {description && <p className="text-muted-foreground text-[13px] leading-[18px]">{description}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
}

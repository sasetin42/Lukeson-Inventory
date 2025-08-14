import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="space-y-2 sticky top-0 bg-background z-10 py-2 -mx-4 px-4 md:-mx-6 md:px-6 border-b mb-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 [&>svg]:size-8 [&>svg]:transition-all [&>svg]:duration-300 header-[data-scrolled=true]_&>svg]:size-6">
          {icon}
          <div className="grid gap-0">
            <h1 className="text-[22px] font-bold tracking-tight leading-[26px] transition-all duration-300 header-[data-scrolled=true]_&]:text-lg">{title}</h1>
            {description && <p className="text-muted-foreground text-[13px] leading-[18px] transition-all duration-300 header-[data-scrolled=true]_&]:text-xs header-[data-scrolled=true]_&]:hidden">{description}</p>}
          </div>
        </div>
        {actions && <div className="transition-all duration-300 header-[data-scrolled=true]_&]:scale-90 header-[data-scrolled=true]_&]:-translate-y-px">{actions}</div>}
      </div>
    </div>
  );
}

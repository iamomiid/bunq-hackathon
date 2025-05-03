"use client";

import React from "react";

interface PageHeaderProps {
  title?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  if (!title && !action) {
    return null;
  }
  
  return (
    <div className="flex justify-between items-center mb-8">
      {title && <h1 className="text-3xl font-bold">{title}</h1>}
      {action && <div>{action}</div>}
    </div>
  );
} 
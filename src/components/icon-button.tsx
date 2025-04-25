"use client";
 

 import * as React from "react";
 

 import { cn } from "@/lib/utils";
 import { ButtonHTMLAttributes, forwardRef } from "react";
 

 export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}
 

 const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, ...props }, ref) => {
  return (
  <button
  className={cn(
  "rounded-full flex items-center justify-center bg-transparent hover:bg-muted p-2",
  className
  )}
  ref={ref}
  {...props}
  >
  {children}
  </button>
  );
 }
 );
 

 IconButton.displayName = "IconButton";
 

 export { IconButton };
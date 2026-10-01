export const shellRoot =
  "h-dvh flex-col gap-3 overflow-hidden bg-app p-safe-3 font-sans text-foreground md:gap-4 md:p-safe-4";

export const shellBody = "flex min-h-0 flex-1 gap-4";

export const shellSidebar =
  "h-auto shrink-0 overflow-hidden rounded-panel border border-border py-2 shadow-panel";

export const shellInset =
  "min-h-0 min-w-0 overflow-hidden rounded-panel border border-border bg-panel py-3 shadow-panel max-md:border-transparent max-md:bg-transparent max-md:py-0 max-md:shadow-none md:py-4";

export const shellContent =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 py-1 [scrollbar-gutter:stable] md:px-6 md:py-2";

export const routeProgress =
  "pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-brand-soft";

export const routeProgressBar =
  "h-full w-1/3 bg-brand motion-safe:animate-route-progress motion-reduce:w-full motion-reduce:opacity-60";

export const phoneShell =
  "fixed inset-0 flex flex-col overflow-hidden bg-app font-sans text-foreground";

export const phoneContent =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain";

export const phoneColumn =
  "flex w-full flex-col px-4 pt-4 pb-6 [body:has([data-floating-action])_&]:pb-24 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150";

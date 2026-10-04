export const authPage = "flex min-h-dvh flex-1 bg-auth p-safe-0 font-sans text-foreground";

export const authHero =
  "relative my-4 ml-4 hidden w-[clamp(360px,42vw,560px)] flex-col overflow-hidden rounded-panel bg-auth-hero p-12 text-on-brand shadow-panel min-[960px]:flex";

export const authHeroBrand =
  "flex items-center gap-3 font-heading text-section font-bold tracking-[0.18em] text-on-brand";

export const authHeroBody =
  "relative z-10 my-auto pb-24 animate-in fade-in-0 slide-in-from-bottom-3 delay-100 duration-700 fill-mode-both motion-reduce:animate-none";

export const authHeroTitle =
  "mb-3 font-heading text-[clamp(28px,2.6vw,36px)] leading-tight font-semibold tracking-tight text-on-brand";

export const authHeroCopy = "max-w-[42ch] text-body leading-relaxed text-on-brand-muted";

export const authHeroList = "mt-8 flex flex-col gap-3.5";

export const authHeroItem = "flex items-center gap-3 text-sm text-on-brand";

export const authHeroIcon =
  "inline-flex size-[34px] shrink-0 items-center justify-center rounded-lg border border-on-brand/20 bg-on-brand/12 text-on-brand [&_svg]:size-4";

export const authHeroArt =
  "pointer-events-none absolute inset-x-0 bottom-0 flex h-[46%] items-end justify-center overflow-hidden text-on-brand opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_60%)]";

export const authHeroArtSvg = "h-auto w-[520px] max-w-none shrink-0";

export const authMain =
  "flex min-w-0 flex-1 flex-col items-center px-6 pt-10 pb-8 min-[480px]:px-10 min-[960px]:py-12";

export const authPanel =
  "my-auto flex w-full max-w-[400px] flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none";

export const authBrand = "mb-12 flex items-center gap-3 min-[960px]:hidden";

export const authMark =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand font-heading text-section font-bold text-on-brand shadow-sm shadow-brand/30";

export const authWordmark =
  "font-heading text-emphasis font-bold tracking-[0.22em] text-foreground";

export const authTitle =
  "font-heading text-hero font-bold tracking-tight text-foreground min-[960px]:text-money-lg";

export const authSubtitle =
  "mt-2 block max-w-[32ch] text-emphasis leading-relaxed text-muted-foreground";

export const authForm = [
  "mt-9 flex flex-col gap-5",
  "[&_[data-slot=field-label]]:text-body [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-label]]:text-foreground",
  "[&_[data-slot=input-group]]:h-13 [&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:bg-panel [&_[data-slot=input-group]]:px-1.5 [&_[data-slot=input-group]]:shadow-none",
  "[&_[data-slot=input-group]]:transition-[border-color,box-shadow] [&_[data-slot=input-group]]:duration-150",
  "[&_[data-slot=input-group-addon]_svg]:size-5 [&_[data-slot=input-group-control]]:text-base",
].join(" ");

export const authMeta = "-mt-3 flex justify-end";

export const authHint =
  "-mr-2 h-11 px-2 text-body font-medium text-brand hover:text-brand-deep";

export const authSuccess = "mt-7 gap-5 border-0 p-0";

export const authSuccessIcon = "size-14 rounded-full bg-brand-soft text-brand [&_svg:not([class*='size-'])]:size-7";

export const authSuccessTitle = "font-heading text-lg font-semibold text-foreground";

export const authSuccessText = "text-sm leading-relaxed text-muted-foreground";

export const authSubmit =
  "h-13 w-full rounded-xl text-emphasis font-semibold shadow-md shadow-brand/20 transition-[background-color,transform,box-shadow] duration-150 data-pressed:scale-98 data-pressed:shadow-sm motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4.5";

export const authDivider =
  "mt-8 flex items-center gap-4 text-label text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border";

export const authAlt =
  "mt-5 flex flex-col items-center gap-0.5 text-body text-muted-foreground";

export const authAltLink = "h-11 gap-1.5 px-3 text-emphasis font-semibold [&_svg:not([class*='size-'])]:size-4";

export const errorPage = "flex min-h-dvh items-center justify-center bg-app p-safe-6 font-sans text-foreground";

export const errorCard = "w-full max-w-[560px] rounded-panel bg-panel py-12 shadow-panel";

export const authPage =
  "flex min-h-dvh flex-1 bg-auth p-safe-0 font-sans text-foreground min-[960px]:bg-app min-[960px]:p-safe-6";

export const authCard =
  "flex min-w-0 flex-1 min-[960px]:m-auto min-[960px]:w-full min-[960px]:max-w-[1040px] min-[960px]:flex-none min-[960px]:min-h-[min(760px,calc(100dvh-3rem))] min-[960px]:overflow-hidden min-[960px]:rounded-panel min-[960px]:bg-auth min-[960px]:shadow-panel";

export const authHero =
  "relative hidden w-[53%] shrink-0 flex-col py-12 pr-[10%] pl-16 text-on-brand min-[960px]:flex";

export const authHeroWave =
  "absolute inset-0 bg-brand/10 [clip-path:polygon(0_0,91%_0,91.5%_10%,92.1%_20%,92.9%_30%,93.7%_40%,94.7%_50%,95.6%_60%,96.7%_70%,97.7%_80%,98.8%_90%,100%_100%,0_100%)]";

export const authHeroFill =
  "absolute inset-0 bg-auth-hero [clip-path:polygon(0_0,84%_0,84.4%_10%,85.2%_20%,86.3%_30%,87.7%_40%,89.3%_50%,91.1%_60%,93%_70%,95.2%_80%,97.5%_90%,99%_100%,0_100%)]";

export const authHeroWordmark = "relative z-10 h-7 w-auto self-start text-on-brand";

export const authHeroBody =
  "relative z-10 mt-20 animate-in fade-in-0 slide-in-from-bottom-3 delay-100 duration-700 fill-mode-both motion-reduce:animate-none";

export const authHeroTitle =
  "mb-5 max-w-[14ch] font-heading text-[clamp(28px,2.6vw,34px)] leading-[1.15] font-bold tracking-tight text-on-brand";

export const authHeroCopy = "max-w-[36ch] text-emphasis leading-relaxed text-on-brand/90";

export const authHeroList = "mt-8 flex flex-col gap-3";

export const authHeroItem = "flex items-center gap-3.5 text-emphasis text-on-brand";

export const authHeroIcon =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-on-brand/20 bg-on-brand/15 text-on-brand [&_svg]:size-5";

export const authHeroArt =
  "pointer-events-none absolute bottom-0 left-0 w-[80%] text-on-brand";

export const authHeroArtSvg = "block h-auto w-full";

export const authHeroArtMark =
  "absolute bottom-[27%] left-[73%] h-auto w-[5.5%] -skew-y-[19deg] text-on-brand/80";

export const authMain =
  "flex min-w-0 flex-1 flex-col items-center px-6 pt-12 pb-8 min-[480px]:px-10 min-[960px]:py-10 min-[960px]:pr-14 min-[960px]:pl-4";

export const authPanel =
  "my-auto flex w-full max-w-[400px] flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none";

export const authBrand = "mb-10 flex items-center gap-4 min-[960px]:mb-7";

export const authMark =
  "inline-flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand shadow-md shadow-brand/25";

export const authMarkGlyph = "h-auto w-7";

export const authWordmark = "h-6.5 w-auto text-brand";

export const authTitle =
  "font-heading text-[2.125rem] leading-tight font-bold tracking-tight text-foreground min-[960px]:text-[2rem]";

export const authSubtitle =
  "mt-2 block max-w-[34ch] text-section leading-relaxed text-muted-foreground min-[960px]:max-w-none min-[960px]:text-emphasis";

export const authForm = [
  "mt-8 flex flex-col gap-6 min-[960px]:mt-7 min-[960px]:gap-4",
  "[&_[data-slot=field-label]]:text-body [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-label]]:text-foreground",
  "[&_[data-slot=input-group]]:h-13.5 min-[960px]:[&_[data-slot=input-group]]:h-12.5 [&_[data-slot=input-group]]:rounded-lg [&_[data-slot=input-group]]:bg-panel [&_[data-slot=input-group]]:px-2 [&_[data-slot=input-group]]:shadow-none",
  "[&_[data-slot=input-group]]:transition-[border-color,box-shadow] [&_[data-slot=input-group]]:duration-150",
  "[&_[data-slot=input-group-addon]_svg]:size-5 [&_[data-slot=input-group-control]]:text-base",
].join(" ");

export const authMeta = "-mt-4 flex justify-end";

export const authHint =
  "-mr-2 h-10 px-2 text-body font-medium text-brand hover:text-brand-deep";

export const authSuccess = "mt-7 gap-5 border-0 p-0";

export const authSuccessIcon = "size-14 rounded-full bg-brand-soft text-brand [&_svg:not([class*='size-'])]:size-7";

export const authSuccessTitle = "font-heading text-lg font-semibold text-foreground";

export const authSuccessText = "text-sm leading-relaxed text-muted-foreground";

export const authSubmit =
  "h-13 w-full rounded-lg text-section min-[960px]:h-12 min-[960px]:text-emphasis font-semibold shadow-md shadow-brand/20 transition-[background-color,transform,box-shadow] duration-150 data-pressed:scale-98 data-pressed:shadow-sm motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4.5";

export const authDivider =
  "mt-9 flex items-center gap-4 text-body min-[960px]:mt-6 text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border";

export const authAlt =
  "mt-6 flex flex-col items-center gap-0.5 text-emphasis text-muted-foreground min-[960px]:mt-3 min-[960px]:text-body";

export const authAltLink = "h-11 gap-1.5 px-3 text-section font-semibold min-[960px]:h-9 min-[960px]:text-emphasis [&_svg:not([class*='size-'])]:size-4";

export const errorPage = "flex min-h-dvh items-center justify-center bg-app p-safe-6 font-sans text-foreground";

export const errorCard = "w-full max-w-[560px] rounded-panel bg-panel py-12 shadow-panel";

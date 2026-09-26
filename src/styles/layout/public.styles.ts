import { cva } from "class-variance-authority";

export const authPage = "flex min-h-dvh flex-1 bg-auth-page font-sans text-foreground";

export const authHero =
  "relative hidden w-[clamp(360px,42vw,560px)] flex-col overflow-hidden bg-auth-hero p-12 text-on-ink min-[960px]:flex";

export const authHeroBrand =
  "flex items-center gap-3 font-heading text-[19px] font-bold tracking-[0.18em] text-on-ink";

export const authHeroBody =
  "relative z-10 my-auto pb-24 animate-in fade-in-0 slide-in-from-bottom-3 delay-100 duration-700 fill-mode-both motion-reduce:animate-none";

export const authHeroTitle =
  "mb-3 font-heading text-[clamp(28px,2.6vw,36px)] leading-tight font-semibold tracking-tight text-on-ink";

export const authHeroCopy = "max-w-[42ch] text-[15px] leading-relaxed text-on-ink-muted";

export const authHeroList = "mt-8 flex flex-col gap-3.5";

export const authHeroItem = "flex items-center gap-3 text-sm text-on-ink";

export const authHeroIcon =
  "inline-flex size-[34px] shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-lime [&_svg]:size-4";

export const authHeroArt =
  "pointer-events-none absolute inset-x-0 bottom-0 flex h-[46%] items-end justify-center overflow-hidden text-lime-soft opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_60%)]";

export const authHeroArtSvg = "h-auto w-[520px] max-w-none shrink-0";

export const authMain =
  "relative flex flex-1 items-center justify-center overflow-hidden px-4 py-6 min-[480px]:px-6 min-[480px]:py-8";

export const authBlob = cva(
  "pointer-events-none absolute rounded-full blur-[80px] animate-drift motion-reduce:animate-none",
  {
    variants: {
      position: {
        a: "-top-30 -right-22 size-[420px] bg-lime/50",
        b: "-bottom-35 -left-28 size-[360px] bg-lilac/40 [animation-delay:-7s]",
        c: "top-[55%] right-[6%] size-[260px] bg-ink/10 [animation-duration:18s]",
      },
    },
  }
);

export const authCard =
  "relative z-10 w-full max-w-[440px] gap-0 rounded-xl border border-border bg-card/90 px-6 py-8 shadow-auth ring-0 backdrop-blur-md animate-in fade-in-0 zoom-in-98 slide-in-from-bottom-4 duration-500 fill-mode-both motion-reduce:animate-none min-[480px]:rounded-shell min-[480px]:px-10 min-[480px]:py-11";

export const authCardBrand = "mb-6 flex items-center gap-2.5 min-[960px]:hidden";

export const authMark =
  "inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg bg-lime font-heading text-[22px] font-bold text-ink";

export const authWordmark =
  "font-heading text-[17px] font-bold tracking-[0.18em] text-foreground";

export const authTitle =
  "mb-1.5 font-heading text-[26px] font-semibold tracking-tight text-foreground";

export const authSubtitle = "block text-sm text-muted-foreground";

export const authForm = "mt-7 flex flex-col gap-4.5";

export const authMeta = "-mt-1.5 mb-1 flex justify-end";

export const authHint =
  "h-auto p-0 text-[13px] font-medium text-muted-foreground hover:text-foreground";

export const authPopover = "w-64 text-[13px] leading-relaxed";

export const authPopoverDialog = "outline-none";

export const authSubmit =
  "h-12 w-full rounded-lg bg-auth-submit bg-left-top text-[15px] font-semibold text-primary-foreground shadow-auth-submit transition-[transform,box-shadow,background-position] duration-300 hover:-translate-y-0.5 hover:bg-right-bottom hover:shadow-auth-submit-hover active:translate-y-0 active:scale-[0.985] dark:bg-none dark:bg-primary";

export const authAlt =
  "mt-6.5 flex flex-wrap items-center justify-center gap-1 border-t border-border-subtle pt-5 text-sm text-muted-foreground";

export const authAltLink = "h-auto p-0 font-semibold";

export const errorPage = "flex min-h-dvh items-center justify-center bg-error-page p-6 font-sans text-foreground";

export const errorCard = "w-full max-w-[560px] rounded-shell border border-border-subtle bg-card py-12 shadow-card";

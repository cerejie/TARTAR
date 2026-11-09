import { CloudCog, FileCheck2, Store } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import {
  authBrand,
  authCard,
  authHero,
  authHeroBody,
  authHeroCopy,
  authHeroFill,
  authHeroIcon,
  authHeroItem,
  authHeroList,
  authHeroTitle,
  authHeroWave,
  authHeroWordmark,
  authHeadingMobileHidden,
  authMain,
  authMark,
  authMarkGlyph,
  authPage,
  authPanel,
  authSubtitle,
  authTitle,
  authWordmark,
} from "../../styles/layout/public.styles";
import BrandMark from "../common/layout/BrandMark";
import BrandWordmark from "../common/layout/BrandWordmark";
import AuthGlassStack from "./AuthGlassStack";

const features = [
  { icon: <Store />, text: "Every branch on one ledger" },
  { icon: <FileCheck2 />, text: "Vouchers with an approval trail" },
  { icon: <CloudCog />, text: "Works offline, syncs when you return" },
] as const;

type IProps = {
  title: string;
  subtitle: string;
  hideHeadingOnMobile?: boolean;
  children: ReactNode;
};

const AuthShell = ({ title, subtitle, hideHeadingOnMobile = false, children }: IProps) => {
  const headingVisibility = hideHeadingOnMobile ? authHeadingMobileHidden : undefined;

  return (
    <div className={authPage}>
      <div className={authCard}>
        <aside className={authHero}>
          <span className={authHeroWave} aria-hidden="true" />
          <span className={authHeroFill} aria-hidden="true" />

          <BrandWordmark className={authHeroWordmark} />

          <div className={authHeroBody}>
            <h1 className={authHeroTitle}>The calm ledger behind a busy tartar.</h1>
            <p className={authHeroCopy}>
              Cash, receivables, payables and vouchers for every branch — kept in
              one quiet, careful place.
            </p>
            <ul className={authHeroList}>
              {features.map((feature) => (
                <li key={feature.text} className={authHeroItem}>
                  <span className={authHeroIcon} aria-hidden="true">
                    {feature.icon}
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>
          </div>

          <AuthGlassStack />
        </aside>

        <main className={authMain}>
          <div className={authPanel}>
            <div className={authBrand}>
              <span className={authMark} aria-hidden="true">
                <BrandMark className={authMarkGlyph} />
              </span>
              <BrandWordmark className={authWordmark} />
            </div>

            <h2 className={cn(authTitle, headingVisibility)}>{title}</h2>
            <p className={cn(authSubtitle, headingVisibility)}>{subtitle}</p>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthShell;

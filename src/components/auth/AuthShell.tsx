import { CloudCog, FileCheck2, Store } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  authBlob,
  authCard,
  authCardBrand,
  authHero,
  authHeroBody,
  authHeroBrand,
  authHeroCopy,
  authHeroIcon,
  authHeroItem,
  authHeroList,
  authHeroTitle,
  authMain,
  authMark,
  authPage,
  authSubtitle,
  authTitle,
  authWordmark,
} from "../../styles/layout/public.styles";
import FarmScene from "./FarmScene";

const features = [
  { icon: <Store />, text: "Every branch on one ledger" },
  { icon: <FileCheck2 />, text: "Vouchers with an approval trail" },
  { icon: <CloudCog />, text: "Works offline, syncs when you return" },
] as const;

type IProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthShell = ({ title, subtitle, children }: IProps) => {
  return (
    <div className={authPage}>
      <aside className={authHero}>
        <div className={authHeroBrand}>
          <span className={authMark} aria-hidden="true">
            T
          </span>
          TARTAR
        </div>

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

        <FarmScene />
      </aside>

      <main className={authMain}>
        <span className={authBlob({ position: "a" })} aria-hidden="true" />
        <span className={authBlob({ position: "b" })} aria-hidden="true" />
        <span className={authBlob({ position: "c" })} aria-hidden="true" />

        <Card className={authCard}>
          <div className={authCardBrand}>
            <span className={authMark} aria-hidden="true">
              T
            </span>
            <span className={authWordmark}>TARTAR</span>
          </div>

          <h2 className={authTitle}>{title}</h2>
          <p className={authSubtitle}>{subtitle}</p>

          {children}
        </Card>
      </main>
    </div>
  );
};

export default AuthShell;

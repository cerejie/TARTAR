import type { ReactNode } from "react";
import {
  listSection,
  listSectionHead,
  listSectionTitle,
} from "../../styles/app/app.styles";

type IProps = {
  title: string;
  children: ReactNode;
};

const DashboardSection = ({ title, children }: IProps) => {
  return (
    <section className={listSection}>
      <header className={listSectionHead}>
        <h2 className={listSectionTitle}>{title}</h2>
      </header>
      {children}
    </section>
  );
};

export default DashboardSection;

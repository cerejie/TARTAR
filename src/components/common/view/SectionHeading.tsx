import type { ReactNode } from "react";
import {
  sectionHeading,
  sectionHeadingExtra,
  sectionHeadingTitle,
} from "../../../styles/view/view.styles";

type IProps = {
  title: string;
  badge?: ReactNode;
  extra?: ReactNode;
};

const SectionHeading = ({ title, badge, extra }: IProps) => {
  return (
    <div className={sectionHeading}>
      <h2 className={sectionHeadingTitle}>{title}</h2>
      {badge}
      {extra ? <div className={sectionHeadingExtra}>{extra}</div> : null}
    </div>
  );
};

export default SectionHeading;

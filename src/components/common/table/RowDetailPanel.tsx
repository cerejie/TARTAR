import type { AnimationEvent } from "react";
import { rowExpansionPersistProps } from "../../../hook/common/expansion.hook";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  rowDetailContent,
  rowDetailField,
  rowDetailLabel,
  rowDetailPanel,
  rowDetailReveal,
  rowDetailRevealClosing,
  rowDetailSection,
  rowDetailSectionIcon,
  rowDetailSectionTitle,
  rowDetailValue,
} from "../../../styles/table/table.css";

type IProps<TRecord> = {
  record: TRecord;
  sections: IDetailSection<TRecord>[];
  collapsing: boolean;
  onCollapsed: () => void;
};

const RowDetailPanel = <TRecord,>({
  record,
  sections,
  collapsing,
  onCollapsed,
}: IProps<TRecord>) => {
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!collapsing || event.target !== event.currentTarget) return;
    onCollapsed();
  };

  return (
    <div
      className={
        collapsing
          ? `${rowDetailReveal} ${rowDetailRevealClosing}`
          : `${rowDetailReveal}`
      }
      onAnimationEnd={handleAnimationEnd}
      {...rowExpansionPersistProps}
    >
      <div className={`${rowDetailPanel}`}>
        <div className={`${rowDetailContent}`}>
          {sections.map((section) => (
            <div key={section.key} className={`${rowDetailSection}`}>
              <div className={`${rowDetailSectionTitle}`}>
                {section.icon ? (
                  <span className={`${rowDetailSectionIcon}`} aria-hidden="true">
                    {section.icon}
                  </span>
                ) : null}
                {section.title}
              </div>
              {section.items.map((item) => (
                <div key={item.key} className={`${rowDetailField}`}>
                  <span className={`${rowDetailLabel}`}>{item.label}</span>
                  <span className={`${rowDetailValue}`}>
                    {item.render(record)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RowDetailPanel;

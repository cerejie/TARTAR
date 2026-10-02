import { Fragment } from "react";
import {
  detailRow,
  detailRowLabel,
  detailRows,
  detailRowValue,
  recordHero,
  recordHeroAmount,
  recordHeroHeading,
  recordHeroName,
  recordHeroSubtitle,
  recordHeroTags,
  recordSheet,
} from "../../../styles/app/app.styles";
import { visibleDetailSections } from "../../../utils/detail.utils";
import AppSheet from "../app/AppSheet";
import SheetActions from "../app/SheetActions";
import RecordDetailSection from "./RecordDetailSection";

import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ICardFields } from "../../../models/common/table.model";

type IProps<T> = {
  open: boolean;
  title: string;
  record: T | undefined;
  fields: ICardFields | undefined;
  sections: readonly IDetailSection<T>[];
  actions: readonly IRowAction[];
  onClose: () => void;
};

const RecordDetailSheet = <T,>({
  open,
  title,
  record,
  fields,
  sections,
  actions,
  onClose,
}: IProps<T>) => {
  const footer = actions.length > 0 ? <SheetActions actions={actions} /> : undefined;

  return (
    <AppSheet
      open={open && record !== undefined}
      kind="detail"
      title={title}
      footer={footer}
      onClose={onClose}
    >
      {record !== undefined && fields ? (
        <div className={recordSheet}>
          <div className={recordHero}>
            <span className={recordHeroHeading}>
              <span className={recordHeroName}>
                {fields.titles.map((field) => (
                  <Fragment key={field.id}>{field.content}</Fragment>
                ))}
              </span>
              {fields.subtitles.map((field) => (
                <span key={field.id} className={recordHeroSubtitle}>
                  {field.content}
                </span>
              ))}
            </span>
            {fields.amounts.map((field) => (
              <span key={field.id} className={recordHeroAmount}>
                {field.content}
              </span>
            ))}
            {fields.statuses.length > 0 ? (
              <span className={recordHeroTags}>
                {fields.statuses.map((field) => (
                  <Fragment key={field.id}>{field.content}</Fragment>
                ))}
              </span>
            ) : null}
          </div>

          {fields.metas.length > 0 ? (
            <dl className={detailRows}>
              {fields.metas.map((field) => (
                <div key={field.id} className={detailRow}>
                  <dt className={detailRowLabel}>{field.title}</dt>
                  <dd className={detailRowValue}>{field.content}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {visibleDetailSections(sections, record).map((section) => (
            <RecordDetailSection
              key={section.key}
              section={section}
              record={record}
            />
          ))}
        </div>
      ) : null}
    </AppSheet>
  );
};

export default RecordDetailSheet;

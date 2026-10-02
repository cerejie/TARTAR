import type { ILedgerFilterScope } from "./filter.model";

export type ViewLayout = "stack" | "bento";

export type BentoSpan =
  | "quarter"
  | "third"
  | "half"
  | "twoThirds"
  | "full"
  | "main"
  | "aside";

export type StatusColor =
  | "default"
  | "positive"
  | "negative"
  | "warning"
  | "info"
  | "brand";

export type ChartTone =
  | "brand"
  | "sky"
  | "violet"
  | "positive"
  | "warning"
  | "negative";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export type DeviceClass =
  | "phone"
  | "tabletPortrait"
  | "tabletLandscape"
  | "desktop";

export interface ISearchMode {
  scope: ILedgerFilterScope;
  placeholder: string;
  pathname: string;
}

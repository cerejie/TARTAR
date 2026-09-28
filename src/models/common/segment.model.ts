export interface ISegmentOption<T extends string> {
  readonly key: T;
  readonly label: string;
  readonly count?: number;
}

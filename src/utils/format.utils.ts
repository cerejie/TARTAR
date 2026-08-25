import dayjs from "dayjs";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export const formatMoney = (
  value: number | string | null | undefined
): string => {
  const amount = Number(value ?? 0);
  return peso.format(Number.isFinite(amount) ? amount : 0);
};

export const formatMoneyCompact = (
  value: number | string | null | undefined
): string => {
  const amount = Number(value ?? 0);
  if (Math.abs(amount) >= 1_000_000)
    return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`;
  return formatMoney(amount);
};

export const formatDate = (value: string | null | undefined): string =>
  value ? dayjs(value).format("MMM D, YYYY") : "—";

export const formatDateTime = (value: string | null | undefined): string =>
  value ? dayjs(value).format("MMM D, YYYY h:mm A") : "—";

export const formatTime = (value: string | null | undefined): string =>
  value ? dayjs(value).format("h:mm A") : "—";

export const todayIso = (): string => dayjs().format("YYYY-MM-DD");

import type { SalesPeriod } from "../../../models/data/dashboard/dashboard.response";
import { create } from "../../common/reset.store";

type States = {
  salesPeriod: SalesPeriod;
};

type Actions = {
  setSalesPeriod: (salesPeriod: SalesPeriod) => void;
};

const initialValues: States = {
  salesPeriod: "daily",
};

export const useDashboardStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSalesPeriod: (salesPeriod) => set({ salesPeriod }),
}));

import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import DashboardDesktop from "./DashboardDesktop";
import DashboardPhone from "./DashboardPhone";

const DashboardBoard = () => {
  const isCompact = useIsCompact();

  return isCompact ? <DashboardPhone /> : <DashboardDesktop />;
};

export default DashboardBoard;

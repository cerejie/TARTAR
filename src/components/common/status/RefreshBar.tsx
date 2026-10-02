import { refreshBar, refreshBarFill } from "../../../styles/status/status.styles";

type IProps = {
  placement: "edge" | "above";
};

const RefreshBar = ({ placement }: IProps) => {
  return (
    <div className={refreshBar({ placement })} role="progressbar" aria-label="Refreshing">
      <div className={refreshBarFill} />
    </div>
  );
};

export default RefreshBar;

import { useNavigation } from "react-router-dom";
import { routeProgress, routeProgressBar } from "../../../styles/layout/shell.styles";

const RouteProgress = () => {
  const navigation = useNavigation();

  if (navigation.state === "idle") return null;

  return (
    <div className={routeProgress} role="progressbar" aria-label="Loading page">
      <div className={routeProgressBar} />
    </div>
  );
};

export default RouteProgress;

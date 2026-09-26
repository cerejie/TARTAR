import { errorCard, errorPage } from "../../../styles/layout/public.styles";
import RouteErrorView from "./RouteErrorView";

const RootErrorView = () => {
  return (
    <div className={errorPage}>
      <div className={errorCard}>
        <RouteErrorView />
      </div>
    </div>
  );
};

export default RootErrorView;

import { CloudDownload, SearchX } from "lucide-react";
import { useNavigate, useRouteError } from "react-router-dom";
import { isChunkLoadError, isNotFoundError } from "../../../utils/error.utils";
import ErrorState from "./ErrorState";

const RouteErrorView = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const reload = () => navigate(0);

  if (isChunkLoadError(error)) {
    return (
      <ErrorState
        icon={<CloudDownload />}
        title="A new version is available"
        description="This page was updated since you opened TARTAR. Reload to get the latest version."
        actionLabel="Reload"
        onAction={reload}
      />
    );
  }

  if (isNotFoundError(error)) {
    return (
      <ErrorState
        icon={<SearchX />}
        title="Page not found"
        description="The page you are looking for does not exist or has moved."
        actionLabel="Back home"
        onAction={() => navigate("/")}
      />
    );
  }

  return (
    <ErrorState
      description="This page failed to load. Your data is safe — try again."
      onAction={reload}
    />
  );
};

export default RouteErrorView;

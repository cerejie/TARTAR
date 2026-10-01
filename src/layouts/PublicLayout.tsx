import { Outlet } from "react-router-dom";
import { backdropThemeColorToken, useThemeColorHook } from "../hook/app/theme.color.hook";

const PublicLayout = () => {
  useThemeColorHook(backdropThemeColorToken);

  return <Outlet />;
};

export default PublicLayout;

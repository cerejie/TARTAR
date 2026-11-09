import { sidebarVersion } from "../../../styles/layout/sidebar.styles";

const AppVersion = () => (
  <span className={sidebarVersion}>v{__APP_VERSION__}</span>
);

export default AppVersion;

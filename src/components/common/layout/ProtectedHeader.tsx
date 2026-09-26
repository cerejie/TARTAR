import { SidebarTrigger } from "@/components/ui/sidebar";
import { useProtectedHeaderHook } from "../../../hook/layout/protected.hook";
import {
  headerActions,
  headerRoot,
  headerSubtitle,
  headerText,
  headerTitle,
  headerTrigger,
} from "../../../styles/layout/header.styles";
import SyncIndicator from "../status/SyncIndicator";

const ProtectedHeader = () => {
  const { title, description } = useProtectedHeaderHook();

  return (
    <header className={headerRoot}>
      <SidebarTrigger variant="outline" size="icon" className={headerTrigger} />
      <div className={headerText}>
        <h1 className={headerTitle}>{title}</h1>
        {description ? <p className={headerSubtitle}>{description}</p> : null}
      </div>
      <div className={headerActions}>
        <SyncIndicator />
      </div>
    </header>
  );
};

export default ProtectedHeader;

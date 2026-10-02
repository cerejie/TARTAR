import { useInstallApp } from "../../../hook/common/install.hook";
import { installModeSubtitles } from "../../../models/common/install.model";
import SectionCard from "../../common/card/SectionCard";
import InstallAppGuide from "../views/InstallAppGuide";

const InstallAppCard = () => {
  const { mode } = useInstallApp();

  return (
    <SectionCard title="Install app" subtitle={installModeSubtitles[mode]}>
      <InstallAppGuide />
    </SectionCard>
  );
};

export default InstallAppCard;

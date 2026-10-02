import { Download, Share } from "lucide-react";
import { useInstallApp } from "../../../hook/common/install.hook";
import {
  installActions,
  installBody,
  installStepIcon,
  installSteps,
  installText,
} from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";

import type { InstallMode } from "../../../models/common/install.model";

const installNotes: Record<Exclude<InstallMode, "prompt" | "ios">, string> = {
  installed: "Open it from your home screen, Start menu or app list.",
  manual:
    "Open your browser menu and choose Install TARTAR or Add to Home Screen. Chrome and Edge install it on Android and Windows.",
};

const InstallAppGuide = () => {
  const { mode, install } = useInstallApp();

  return (
    <div className={installBody}>
      {mode === "prompt" ? (
        <div className={installActions}>
          <AppButton onClick={() => void install()}>
            <Download />
            Install TARTAR
          </AppButton>
        </div>
      ) : null}

      {mode === "ios" ? (
        <ol className={installSteps}>
          <li>
            Tap Share <Share className={installStepIcon} aria-label="Share" /> in Safari
          </li>
          <li>Choose Add to Home Screen</li>
          <li>Tap Add</li>
        </ol>
      ) : null}

      {mode === "installed" || mode === "manual" ? (
        <p className={installText}>{installNotes[mode]}</p>
      ) : null}
    </div>
  );
};

export default InstallAppGuide;

import { accountPanelSheetModalKey, syncSheetModalKey } from "../../keys/modal.keys";
import { installModeSubtitles } from "../../models/common/install.model";
import { pushModeSubtitles } from "../../models/common/push.model";
import { formatDateTime } from "../../utils/format.utils";
import { useInstallApp } from "../common/install.hook";
import { useModalActions } from "../common/modal.hook";
import { useSyncStatus } from "../common/network.hook";
import { usePushNotifications } from "../common/push.hook";
import { useProtectedUserHook } from "../layout/protected.hook";

import type { AccountPanel } from "../../models/data/account/account.response";

export const useAccountSettingsListHook = () => {
  const { openModal } = useModalActions();
  const { mode: installMode } = useInstallApp();
  const { mode: pushMode } = usePushNotifications();
  const { description: syncHint } = useSyncStatus();
  const { displayName, roleLabel, avatarUrl, isDark, toggleMode } = useProtectedUserHook();

  return {
    profileHint:
      !roleLabel || displayName === roleLabel ? displayName : `${displayName} · ${roleLabel}`,
    profileAvatarUrl: avatarUrl,
    installHint: installModeSubtitles[installMode],
    notificationsHint: pushModeSubtitles[pushMode],
    themeHint: isDark ? "Dark" : "Light",
    isDark,
    toggleMode,
    syncHint,
    buildHint: `Built ${formatDateTime(__APP_BUILT_AT__)}`,
    openPanel: (panel: AccountPanel) => openModal(accountPanelSheetModalKey(panel)),
    openSync: () => openModal(syncSheetModalKey),
  };
};

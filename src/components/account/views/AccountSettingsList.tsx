import {
  Bell,
  CloudCheck,
  Download,
  Info,
  KeyRound,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { useAccountSettingsListHook } from "../../../hook/account/account.settings.list.hook";
import {
  passwordSubtitle,
  profileSubtitle,
} from "../../../models/data/account/account.response";
import { settingsList } from "../../../styles/account/account.styles";
import ListCard from "../../common/app/ListCard";
import ListSection from "../../common/app/ListSection";
import ChangePasswordForm from "../forms/ChangePasswordForm";
import AccountPanelSheet from "../modal/AccountPanelSheet";
import InstallAppGuide from "./InstallAppGuide";
import NotificationsControls from "./NotificationsControls";
import ProfileDetails from "./ProfileDetails";

const AccountSettingsList = () => {
  const {
    profileHint,
    installHint,
    notificationsHint,
    themeHint,
    isDark,
    toggleMode,
    syncHint,
    buildHint,
    openPanel,
    openSync,
  } = useAccountSettingsListHook();

  return (
    <div className={settingsList}>
      <ListSection title="Account" itemCount={2} emptyText="">
        <ListCard
          name="Profile"
          description={profileHint}
          icon={<UserRound />}
          onPress={() => openPanel("profile")}
        />
        <ListCard
          name="Password"
          description={passwordSubtitle}
          icon={<KeyRound />}
          onPress={() => openPanel("password")}
        />
      </ListSection>

      <ListSection title="App" itemCount={3} emptyText="">
        <ListCard
          name="Install TARTAR"
          description={installHint}
          icon={<Download />}
          onPress={() => openPanel("install")}
        />
        <ListCard
          name="Theme"
          description={themeHint}
          icon={isDark ? <Moon /> : <Sun />}
          onPress={toggleMode}
        />
        <ListCard
          name="Notifications"
          description={notificationsHint}
          icon={<Bell />}
          onPress={() => openPanel("notifications")}
        />
      </ListSection>

      <ListSection title="System" itemCount={2} emptyText="">
        <ListCard
          name="Sync"
          description={syncHint}
          icon={<CloudCheck />}
          onPress={openSync}
        />
        <ListCard name="Version" description={buildHint} icon={<Info />} />
      </ListSection>

      <AccountPanelSheet panel="profile" description={profileSubtitle}>
        <ProfileDetails />
      </AccountPanelSheet>
      <AccountPanelSheet panel="password" description={passwordSubtitle}>
        <ChangePasswordForm />
      </AccountPanelSheet>
      <AccountPanelSheet panel="install" description={installHint}>
        <InstallAppGuide />
      </AccountPanelSheet>
      <AccountPanelSheet panel="notifications" description={notificationsHint}>
        <NotificationsControls />
      </AccountPanelSheet>
    </div>
  );
};

export default AccountSettingsList;

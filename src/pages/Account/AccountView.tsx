import AccountProfileCard from "../../components/account/cards/AccountProfileCard";
import InstallAppCard from "../../components/account/cards/InstallAppCard";
import NotificationsCard from "../../components/account/cards/NotificationsCard";
import ChangePasswordCard from "../../components/account/forms/ChangePasswordCard";
import AccountSettingsList from "../../components/account/views/AccountSettingsList";
import BentoCell from "../../components/common/view/BentoCell";
import ContentView from "../../components/common/view/ContentView";
import { useIsCompact } from "../../hook/common/breakpoint.hook";

const AccountView = () => {
  const isCompact = useIsCompact();

  if (isCompact) {
    return (
      <ContentView>
        <AccountSettingsList />
      </ContentView>
    );
  }

  return (
    <ContentView layout="bento">
      <BentoCell span="half">
        <AccountProfileCard />
      </BentoCell>
      <BentoCell span="half">
        <ChangePasswordCard />
      </BentoCell>
      <BentoCell span="half">
        <InstallAppCard />
      </BentoCell>
      <BentoCell span="half">
        <NotificationsCard />
      </BentoCell>
    </ContentView>
  );
};

export default AccountView;

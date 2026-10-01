import AccountProfileCard from "../../components/account/cards/AccountProfileCard";
import InstallAppCard from "../../components/account/cards/InstallAppCard";
import NotificationsCard from "../../components/account/cards/NotificationsCard";
import ChangePasswordCard from "../../components/account/forms/ChangePasswordCard";
import BentoCell from "../../components/common/view/BentoCell";
import ContentView from "../../components/common/view/ContentView";

const AccountView = () => {
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

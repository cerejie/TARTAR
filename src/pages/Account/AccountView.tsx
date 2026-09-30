import AccountProfileCard from "../../components/account/cards/AccountProfileCard";
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
    </ContentView>
  );
};

export default AccountView;

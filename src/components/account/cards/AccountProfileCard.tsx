import { profileSubtitle } from "../../../models/data/account/account.response";
import SectionCard from "../../common/card/SectionCard";
import ProfileDetails from "../views/ProfileDetails";

const AccountProfileCard = () => {
  return (
    <SectionCard title="Profile" subtitle={profileSubtitle}>
      <ProfileDetails />
    </SectionCard>
  );
};

export default AccountProfileCard;

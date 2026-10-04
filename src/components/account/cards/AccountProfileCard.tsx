import { profileSubtitle } from "../../../models/data/account/account.response";
import SectionCard from "../../common/card/SectionCard";
import ProfileAvatar from "../views/ProfileAvatar";
import ProfileDetails from "../views/ProfileDetails";

const AccountProfileCard = () => {
  return (
    <SectionCard title="Profile" subtitle={profileSubtitle}>
      <ProfileAvatar />
      <ProfileDetails />
    </SectionCard>
  );
};

export default AccountProfileCard;

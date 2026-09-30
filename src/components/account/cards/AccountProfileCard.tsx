import { useAccountSettingsHook } from "../../../hook/account/account.settings.hook";
import {
  profileLabel,
  profileList,
  profileRow,
  profileValue,
} from "../../../styles/account/account.styles";
import SectionCard from "../../common/card/SectionCard";

const AccountProfileCard = () => {
  const { profileRows } = useAccountSettingsHook();

  return (
    <SectionCard
      title="Profile"
      subtitle="Your name, role and branches are managed by your administrator."
    >
      <dl className={profileList}>
        {profileRows.map((row) => (
          <div key={row.label} className={profileRow}>
            <dt className={profileLabel}>{row.label}</dt>
            <dd className={profileValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
};

export default AccountProfileCard;

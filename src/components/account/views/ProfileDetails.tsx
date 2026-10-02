import { useAccountSettingsHook } from "../../../hook/account/account.settings.hook";
import {
  profileLabel,
  profileList,
  profileRow,
  profileValue,
} from "../../../styles/account/account.styles";

const ProfileDetails = () => {
  const { profileRows } = useAccountSettingsHook();

  return (
    <dl className={profileList}>
      {profileRows.map((row) => (
        <div key={row.label} className={profileRow}>
          <dt className={profileLabel}>{row.label}</dt>
          <dd className={profileValue}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default ProfileDetails;

import { passwordSubtitle } from "../../../models/data/account/account.response";
import SectionCard from "../../common/card/SectionCard";
import ChangePasswordForm from "./ChangePasswordForm";

const ChangePasswordCard = () => {
  return (
    <SectionCard title="Change password" subtitle={passwordSubtitle}>
      <ChangePasswordForm />
    </SectionCard>
  );
};

export default ChangePasswordCard;

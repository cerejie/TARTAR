import { Tag } from "antd";
import {
  partyInfoState,
  type ICustomer,
  type PartyInfoState,
} from "../../models/data/party/party.response";

const infoTags: Record<PartyInfoState, { color: string; label: string }> = {
  complete: { color: "green", label: "Complete" },
  partial: { color: "gold", label: "Incomplete" },
  none: { color: "default", label: "Not filled" },
};

type IProps = {
  customer: ICustomer | undefined;
};

const CustomerInfoTag = ({ customer }: IProps) => {
  const { color, label } = infoTags[partyInfoState(customer)];

  return <Tag color={color}>{label}</Tag>;
};

export default CustomerInfoTag;

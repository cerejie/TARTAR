import {
  partyInfoState,
  type ICustomer,
  type PartyInfoState,
} from "../../models/data/party/party.response";
import StatusTag from "../common/status/StatusTag";
import type { StatusColor } from "../../models/common/view.model";

const infoTags: Record<PartyInfoState, { color: StatusColor; label: string }> = {
  complete: { color: "positive", label: "Complete" },
  partial: { color: "warning", label: "Incomplete" },
  none: { color: "default", label: "Not filled" },
};

type IProps = {
  customer: ICustomer | undefined;
};

const CustomerInfoTag = ({ customer }: IProps) => {
  const { color, label } = infoTags[partyInfoState(customer)];

  return <StatusTag color={color} label={label} />;
};

export default CustomerInfoTag;

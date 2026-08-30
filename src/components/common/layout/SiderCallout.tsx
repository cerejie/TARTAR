import { Button, Flex } from "antd";
import {
  siderCallout,
  siderCalloutAction,
  siderCalloutBody,
  siderCalloutTitle,
} from "../../../styles/layout/protected.layout.css";

type IProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

const SiderCallout = ({
  title,
  description,
  actionLabel,
  onAction,
}: IProps) => {
  return (
    <Flex vertical className={`${siderCallout}`}>
      <span className={`${siderCalloutTitle}`}>{title}</span>
      <span className={`${siderCalloutBody}`}>{description}</span>
      <Button className={`${siderCalloutAction}`} onClick={onAction}>
        {actionLabel}
      </Button>
    </Flex>
  );
};

export default SiderCallout;

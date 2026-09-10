import { Flex, Modal } from "antd";
import type { ReactNode } from "react";
import { modalWidths, type ModalSize } from "../../../models/common/view.model";
import {
  appModal,
  modalSubtitle,
  modalTitle,
} from "../../../styles/modal/modal.css";

type IProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const AppModal = ({
  open,
  title,
  subtitle,
  size = "md",
  footer,
  onClose,
  children,
}: IProps) => {
  return (
    <Modal
      className={`${appModal}`}
      open={open}
      centered
      width={modalWidths[size]}
      onCancel={onClose}
      footer={footer ?? null}
      destroyOnHidden
      maskClosable={false}
      title={
        <Flex vertical>
          <span className={`${modalTitle}`}>{title}</span>
          {subtitle ? (
            <span className={`${modalSubtitle}`}>{subtitle}</span>
          ) : null}
        </Flex>
      }
    >
      {children}
    </Modal>
  );
};

export default AppModal;

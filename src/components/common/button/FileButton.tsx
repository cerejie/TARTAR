import type { ComponentProps } from "react";
import { FileTrigger } from "react-aria-components";
import AppButton from "./AppButton";

type IProps = Omit<ComponentProps<typeof AppButton>, "onPress" | "href"> & {
  acceptedFileTypes?: readonly string[];
  onSelect: (files: FileList | null) => void;
};

const FileButton = ({ acceptedFileTypes, onSelect, ...props }: IProps) => {
  return (
    <FileTrigger
      acceptedFileTypes={acceptedFileTypes ? [...acceptedFileTypes] : undefined}
      onSelect={onSelect}
    >
      <AppButton {...props} />
    </FileTrigger>
  );
};

export default FileButton;

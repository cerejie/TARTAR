import type { ComponentProps, ReactNode } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

type IProps = Omit<ComponentProps<typeof Button>, "children" | "isDisabled"> & {
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  href?: string;
  tooltip?: string;
};

const AppButton = ({
  loading = false,
  disabled,
  children,
  href,
  tooltip,
  ...props
}: IProps) => {
  const isDisabled = disabled || loading;

  if (href !== undefined) {
    return (
      <LinkButton
        href={href}
        variant={props.variant}
        size={props.size}
        aria-label={props["aria-label"]}
        className={props.className}
        isDisabled={isDisabled}
      >
        {children}
      </LinkButton>
    );
  }

  const button = (
    <Button {...props} isDisabled={isDisabled}>
      {loading ? <Spinner /> : null}
      {children}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <TooltipTrigger>
      {button}
      <Tooltip>{tooltip}</Tooltip>
    </TooltipTrigger>
  );
};

export default AppButton;

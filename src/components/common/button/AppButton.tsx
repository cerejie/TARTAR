import type { ComponentProps, ReactNode } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type IProps = Omit<ComponentProps<typeof Button>, "children" | "isDisabled"> & {
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  href?: string;
};

const AppButton = ({
  loading = false,
  disabled,
  children,
  href,
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

  return (
    <Button {...props} isDisabled={isDisabled}>
      {loading ? <Spinner /> : null}
      {children}
    </Button>
  );
};

export default AppButton;

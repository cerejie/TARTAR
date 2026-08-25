import { useAccountMeHook } from "../account/account.me.hook";

export const useViewHook = () => {
  const { kind, routes } = useAccountMeHook();

  return { kind, routes };
};

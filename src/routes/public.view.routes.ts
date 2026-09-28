import type { IRoute } from "../models/common/route.model";
import LoginView from "../pages/Auth/LoginView";
import RegisterView from "../pages/Auth/RegisterView";
import { adminBasePath } from "../utils/route.utils";

export const publicViewsRoutes: IRoute[] = [
  {
    key: "home",
    path: "/",
    label: "Sign in",
    Component: LoginView,
  },
  {
    key: "login",
    path: "/login",
    label: "Sign in",
    Component: LoginView,
  },
  {
    key: "admin_login",
    path: `${adminBasePath}/*`,
    label: "Sign in",
    Component: LoginView,
  },
  {
    key: "register",
    path: "/register",
    label: "Create account",
    Component: RegisterView,
  },
];

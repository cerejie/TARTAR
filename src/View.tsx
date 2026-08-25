import { RouterProvider } from "react-router-dom";
import { useViewHook } from "./hook/view/view.hook";

const View = () => {
  const { kind, routes } = useViewHook();

  return <RouterProvider key={kind ?? "public"} router={routes} />;
};

export default View;

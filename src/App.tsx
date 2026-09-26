import { Toaster } from "@/components/ui/sonner";
import ConfirmationModal from "./components/common/modal/ConfirmationModal";
import { useAppHook } from "./hook/app/app.hook";
import View from "./View";

const App = () => {
  useAppHook();

  return (
    <>
      <View />
      <ConfirmationModal />
      <Toaster position="top-center" />
    </>
  );
};

export default App;

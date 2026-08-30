import { Menu } from "antd";
import { useProtectedMenuHook } from "../../../hook/layout/protected.hook";
import { menuWrapper } from "../../../styles/layout/protected.layout.css";

const ProtectedMenu = () => {
  const { items, selectedKey, onSelect } = useProtectedMenuHook();

  return (
    <Menu
      className={`${menuWrapper}`}
      theme="dark"
      mode="inline"
      inlineIndent={20}
      selectedKeys={[selectedKey]}
      items={items}
      onClick={({ key }) => onSelect(key)}
    />
  );
};

export default ProtectedMenu;

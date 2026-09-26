import ContentView from "../../components/common/view/ContentView";
import UserCreateButton from "../../components/user/menus/UserCreateButton";
import UsersTable from "../../components/user/tables/UsersTable";

const UsersView = () => {
  return (
    <ContentView actions={<UserCreateButton />}>
      <UsersTable />
    </ContentView>
  );
};

export default UsersView;

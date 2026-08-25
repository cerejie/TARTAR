import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Popover, Typography } from "antd";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/form/FormField";
import { useAccountLoginHook } from "../../hook/account/account.login.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import type { ILoginFormInput } from "../../models/data/account/account.request";
import {
  authAlt,
  authForm,
  authHint,
  authMeta,
  authPopover,
  authSubmit,
} from "../../styles/layout/public.layout.css";

const { Text } = Typography;

const fields: IFieldConfig<ILoginFormInput>[] = [
  {
    name: "identifier",
    label: "Email or username",
    type: "text",
    placeholder: "you@company.com or username",
    icon: <UserOutlined />,
    autoComplete: "username",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: <LockOutlined />,
    autoComplete: "current-password",
  },
];

const LoginView = () => {
  const { control, loginMutation, onSubmit } = useAccountLoginHook();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your business."
    >
      <Form layout="vertical" className={`${authForm}`} onFinish={onSubmit}>
        {fields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}

        <Flex className={`${authMeta}`} justify="flex-end">
          <Popover
            trigger="click"
            placement="topRight"
            content={
              <Text className={`${authPopover}`}>
                Password resets are handled by your administrator — ask them to
                set a new one for your account.
              </Text>
            }
          >
            <Button type="link" className={`${authHint}`}>
              Forgot password?
            </Button>
          </Popover>
        </Flex>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loginMutation.loading}
          className={`${authSubmit}`}
        >
          Sign in
        </Button>
      </Form>

      <Text className={`${authAlt}`}>
        New employee? <Link to="/register">Create an account</Link>
      </Text>
    </AuthShell>
  );
};

export default LoginView;

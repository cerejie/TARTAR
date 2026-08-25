import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Typography } from "antd";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/form/FormField";
import { useAccountRegisterHook } from "../../hook/account/account.register.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import type { IRegisterInput } from "../../models/data/account/account.request";
import {
  authAlt,
  authForm,
  authSubmit,
} from "../../styles/layout/public.layout.css";

const { Text } = Typography;

const fields: IFieldConfig<IRegisterInput>[] = [
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "letters and numbers only",
    icon: <UserOutlined />,
    autoComplete: "username",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Choose a strong password",
    icon: <LockOutlined />,
  },
];

const RegisterView = () => {
  const { control, registerMutation, onSubmit } = useAccountRegisterHook();

  return (
    <AuthShell
      title="Create your account"
      subtitle="An admin approves new registrations before first sign-in."
    >
      <Form layout="vertical" className={`${authForm}`} onFinish={onSubmit}>
        {fields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={registerMutation.loading}
          className={`${authSubmit}`}
        >
          Create account
        </Button>
      </Form>

      <Text className={`${authAlt}`}>
        Already have an account? <Link to="/login">Sign in</Link>
      </Text>
    </AuthShell>
  );
};

export default RegisterView;

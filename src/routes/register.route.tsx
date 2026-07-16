import { createRoute, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { rootRoute } from './__root'
import { AuthShell } from '../components/auth/AuthShell'
import { FormField } from '../components/form/FormField'
import { useAuth } from '../hooks/useAuth'
import { useMutation } from '../hooks/useMutation'
import { registerSchema, type RegisterInput } from '../models'

/**
 * Public self-registration (build spec §4). Creates a PENDING employee that an
 * Admin/superAdmin must approve before the account can log in.
 */
export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '' },
  })
  const { mutate, loading } = useMutation(register, {
    successMessage: 'Account created — an admin must approve it before you can sign in.',
    onSuccess: () => void navigate({ to: '/login' }),
  })

  return (
    <AuthShell
      title="Create your account"
      subtitle="An admin approves new registrations before first sign-in."
    >
      <Form
        layout="vertical"
        className="tartar-auth-form"
        onFinish={handleSubmit((v) => void mutate(v))}
      >
        <FormField
          config={{
            name: 'username',
            label: 'Username',
            type: 'text',
            placeholder: 'letters and numbers only',
            icon: <UserOutlined />,
            autoComplete: 'username',
          }}
          control={control}
        />
        <FormField
          config={{
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Choose a strong password',
            icon: <LockOutlined />,
          }}
          control={control}
        />

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="tartar-auth-submit"
        >
          Create account
        </Button>
      </Form>

      <Typography.Text className="tartar-auth-alt">
        Already have an account? <Link to="/login">Sign in</Link>
      </Typography.Text>
    </AuthShell>
  )
}

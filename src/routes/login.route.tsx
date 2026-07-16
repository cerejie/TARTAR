import { createRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Popover, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { rootRoute } from './__root'
import { AuthShell } from '../components/auth/AuthShell'
import { FormField } from '../components/form/FormField'
import { useAuth } from '../hooks/useAuth'
import { useMutation } from '../hooks/useMutation'
import { useAuthStore } from '../stores/auth.store'
import { loginFormSchema, isEmailIdentifier, type LoginFormInput } from '../models'

/** Public login route. Already-signed-in users skip straight to the app. */
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    if (useAuthStore.getState().kind) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

/**
 * Single login form (build spec §4). The identifier field auto-detects the
 * login type — no tabs, no role selector, no developer toggle: an email routes
 * to the superAdmin's Supabase Auth login; anything else logs in a regular
 * user by username.
 *
 * Deliberately no "remember me": sessions are always persisted (auth.store),
 * so the checkbox would be decorative. "Forgot password?" is a hint popover,
 * not a flow — resets are handled by an admin in this auth model.
 */
function LoginPage() {
  const navigate = useNavigate()
  const { loginCustom, loginSuperAdmin } = useAuth()
  const { control, handleSubmit } = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: '', password: '' },
  })
  const { mutate, loading } = useMutation(
    (v: LoginFormInput) => {
      const identifier = v.identifier.trim()
      return isEmailIdentifier(identifier)
        ? loginSuperAdmin({ email: identifier, password: v.password })
        : loginCustom({ username: identifier, password: v.password })
    },
    { onSuccess: () => void navigate({ to: '/' }) },
  )

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue managing your business.">
      <Form
        layout="vertical"
        className="tartar-auth-form"
        onFinish={handleSubmit((v) => void mutate(v))}
      >
        <FormField
          config={{
            name: 'identifier',
            label: 'Email or username',
            type: 'text',
            placeholder: 'you@company.com or username',
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
            placeholder: 'Enter your password',
            icon: <LockOutlined />,
            autoComplete: 'current-password',
          }}
          control={control}
        />

        <div className="tartar-auth-meta">
          <Popover
            trigger="click"
            placement="topRight"
            content={
              <div className="tartar-auth-pop">
                Password resets are handled by your administrator — ask them to
                set a new one for your account.
              </div>
            }
          >
            <Button type="link" className="tartar-auth-hint">
              Forgot password?
            </Button>
          </Popover>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="tartar-auth-submit"
        >
          Sign in
        </Button>
      </Form>

      <Typography.Text className="tartar-auth-alt">
        New employee? <Link to="/register">Create an account</Link>
      </Typography.Text>
    </AuthShell>
  )
}

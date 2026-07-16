import { createRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Flex, Form, Typography } from 'antd'
import { rootRoute } from './__root'
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
    <Flex className="tartar-auth-wrap" align="center" justify="center">
      <Card className="tartar-auth-card">
        <Typography.Title level={2} className="tartar-brand tartar-auth-brand">
          TARTAR
        </Typography.Title>
        <Typography.Text type="secondary">Business Management System</Typography.Text>

        <Form
          layout="vertical"
          className="tartar-auth-tabs"
          onFinish={handleSubmit((v) => void mutate(v))}
        >
          <FormField
            config={{ name: 'identifier', label: 'Username', type: 'text', placeholder: 'username' }}
            control={control}
          />
          <FormField config={{ name: 'password', label: 'Password', type: 'password' }} control={control} />
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign in
          </Button>
        </Form>

        <Typography.Text type="secondary">
          New employee? <Link to="/register">Create an account</Link>
        </Typography.Text>
      </Card>
    </Flex>
  )
}

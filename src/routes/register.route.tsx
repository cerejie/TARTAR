import { createRoute, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Flex, Form, Typography } from 'antd'
import { rootRoute } from './__root'
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
    <Flex className="tartar-auth-wrap" align="center" justify="center">
      <Card className="tartar-auth-card">
        <Typography.Title level={2} className="tartar-brand tartar-auth-brand">
          Create account
        </Typography.Title>
        <Typography.Text type="secondary">
          Your registration will await admin approval.
        </Typography.Text>

        <Form layout="vertical" className="tartar-auth-tabs" onFinish={handleSubmit((v) => void mutate(v))}>
          <FormField
            config={{ name: 'username', label: 'Username', type: 'text', placeholder: 'letters and numbers only' }}
            control={control}
          />
          <FormField config={{ name: 'password', label: 'Password', type: 'password' }} control={control} />
          <Button type="primary" htmlType="submit" block loading={loading}>
            Register
          </Button>
        </Form>

        <Typography.Text type="secondary">
          Already have an account? <Link to="/login">Sign in</Link>
        </Typography.Text>
      </Card>
    </Flex>
  )
}

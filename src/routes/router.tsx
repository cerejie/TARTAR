import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { loginRoute } from './login.route'
import { registerRoute } from './register.route'
import { appLayoutRoute } from './app.route'
import { dashboardRoute } from './dashboard.route'
import { transactionsRoute } from './transactions.route'
import { receivablesRoute } from './receivables.route'
import { payablesRoute } from './payables.route'
import { vouchersRoute } from './vouchers.route'
import { usersRoute } from './users.route'
import { reportsRoute } from './reports.route'
import { branchesRoute } from './branches.route'

/**
 * Code-based route tree (the locked stack has no file-based codegen plugin).
 * Public routes sit directly under root; every authenticated page lives under
 * the guarded `appLayoutRoute` (see app.route.tsx).
 */
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  appLayoutRoute.addChildren([
    dashboardRoute,
    transactionsRoute,
    receivablesRoute,
    payablesRoute,
    vouchersRoute,
    usersRoute,
    reportsRoute,
    branchesRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { indexRoute } from './index.route'

/**
 * Code-based route tree. The locked stack does not include the TanStack Router
 * file-based codegen plugin, so routes are assembled explicitly here.
 */
const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

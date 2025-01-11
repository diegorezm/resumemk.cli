import {createRootRoute, Outlet} from '@tanstack/react-router'
import React from "react"

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
      // Lazy load in development
      import('@tanstack/router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    )

const Root = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({
  component: Root
})


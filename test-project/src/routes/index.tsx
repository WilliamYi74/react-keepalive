import { RouteObject } from 'react-router-dom'
import Layout from '../pages/layout'
import Page1 from '../pages/page1'
import Page2 from '../pages/page2'
import Page3 from '../pages/page3'
import { KeepAliveItem } from '@williamyi74/react-keepalive/es'
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <KeepAliveItem key="page1" cacheId="page1">
            <Page1 />
          </KeepAliveItem>
        ),
      },
      {
        path: '/page2',
        element: (
          <KeepAliveItem key="page2" cacheId="page2">
            <Page2 />
          </KeepAliveItem>
        ),
      },
      {
        path: '/page3',
        element: (
          <KeepAliveItem key="page3" cacheId="page3">
            <Page3 />
          </KeepAliveItem>
        ),
      },
    ],
  },
]
export default routes

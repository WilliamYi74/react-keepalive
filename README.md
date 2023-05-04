# react-keepalive &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@williamyi74/react-keepalive.svg)](https://www.npmjs.com/package/@williamyi74/react-keepalive)

a react cache component based on react@18+

## Description

组件一共对外暴露了三个接口: KeepaliveScope组件,KeepAliveItem组件及hook函数useCacheDestroy
1. 用KeepaliveScope组件包裹整个应用
2. 用KeepaliveItem组件包裹你要缓存的组件给上缓存ID和Key 缓存ID和Key可以设置为一样且要唯一
3. 被Keepalive组件包裹的组件会注入onActived和onUnActived生命周期钩子函数传入一个回调和缓存组件的cacheId 这个回调会在组件被激活和休眠时执行 下面会演示
4. useCacheDestroy这个hook会返回一个销毁组件缓存的函数 传入cacheId即可销毁当前为休眠状态的缓存组件 但是不可销毁正处于激活状态的组件

## Usage step

使用npm yarn pnpm安装到项目

```bash
npm i @williamyi74/react-keepalive
yarn add @williamyi74/react-keepalive
pnpm add @williamyi74/react-keepalive
```

首先用KeepAliveScope组件包裹应用 注意要被包裹在Router组件里面 否则路由hooks会用不了

index.tsx/main.tsx:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { KeepAliveScope } from '@williamyi74/react-keepalive/es'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <KeepAliveScope>
        <App />
      </KeepAliveScope>
    </BrowserRouter>
  </React.StrictMode>
)
```

一般都是用来包裹路由组件:

- 使用react-router@5.x写法:

```tsx
import { Route } from 'react-router-dom'
import { KeepAliveItem } from '@williamyi74/react-keepalive/es'
import List 'geek-pc/pages/list/list'
export const ListCacheId = 'KEEPALIVE_LIST'
const Layout = () => {
    return (
            <Route path="/">
                <KeepAliveItem cacheId={ListCacheId} key={ListCacheId}>
                    <List />
                </KeepAliveItem>
            </Route>
           )
}
export default Layout;
```

- 使用react-router@6.x的路由映射表写法:

Page1组件演示被包裹的业务组件使用细节:

```tsx
import { KeepAliveItem } from '@williamyi74/react-keepalive/es'
import { useCacheDestroy } from '@williamyi74/react-keepalive/es'
import { KeepAliveItemMergeProps } from '@williamyi74/react-keepalive/es/components/keepalive-item'
// 被KeepAliveItem组件包裹的业务组件Props会注入两个生命周期钩子函数和cacheId
// 编写被包裹的业务组件自身的业务props类型传入KeepAliveItemMergeProps
interface IProps {
    // ...
}
const Input = () => <input />
const InputCacheId = 'KEEPALIVE_INPUT'
const Page1 = ({
  onActived,
  onUnActived,
  cacheId,
}: KeepAliveItemMergeProps<IProps>) => {
  const cacheDestroy = useCacheDestroy() // 缓存销毁的hook
  // 组件加载后注册生命周期钩子函数
  useEffect(() => {
    onActived!(() => {
      console.log('Page1组件激活了')
    }, cacheId!)

    onUnActived!(() => {
      console.log('Page1组件休眠了')
    }, cacheId!)
  }, [])
  const [show, setShow] = useState(false)
  return (
    <>
      <h2>page1</h2>
      {show && (
        <KeepAliveItem key={InputCacheId} cacheId={InputCacheId}>
        {/* 缓存非路由组件的自定义组件 不要直接写原生html元素 用一个自定义组件封装起来 */}
          <Input /> 
        </KeepAliveItem>
      )}
      <button
        onClick={() => {
          cacheDestroy('page2') // 销毁cacheId为page2的缓存组件 注意缓存组件里嵌套的缓存组件无法销毁 因为外层缓存组件包含了嵌套的缓存组件元素 所以一样还是会被缓存
        }}
      >
        清除缓存
      </button>
      <button onClick={() => setShow((prev) => !prev)}>
        {show ? '隐藏' : '显示'}
      </button>
    </>
  )
}
```

routes.tsx文件:

```tsx
import { RouteObject } from 'react-router-dom'
import { KeepAliveItem } from '@williamyi74/react-keepalive/es'
import Page1 from '@/pages/keep-alive-practice/page-1/page-1'
export const Page1CacheId = 'KEEPALIVE_PAGE1'
const routes:RouteObject[] = [
  {
    path: '/page1',
    element: (
      <KeepAliveItem cacheId={Page1CacheId} key={Page1CacheId}>
        <Page1 />
      </KeepAliveItem>
    ),
  }
]
export default routes
```

容器组件里渲染:

```tsx
import { useRoutes } from 'react-router-dom'
import routes from '@/routes'
const Layout = () => {
    return useRoutes(routes)
}
export default Layout
```
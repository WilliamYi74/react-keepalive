import KeepAliveContext, {
  CacheActionPayload,
  CacheActionType,
  KeppAliveContextType,
  cacheReducer,
} from '../components/context'
import { FC, ReactNode, useMemo, useReducer } from 'react'
import KeepaliveScopeItem from './keepalive-scope-item'
export type KeepAliveScopeProps = {
  children: ReactNode
}
/**
 * KeepAliveScope组件负责将缓存组件状态和突变状态的函数暴露给子组件树
 */
const KeepAliveScope: FC<KeepAliveScopeProps> = ({ children }) => {
  const [caches, cacheDispatch] = useReducer(cacheReducer, [])
  const contextValue: KeppAliveContextType = useMemo(() => {
    return {
      caches,
      cacheDispatch,
      getCacheById(cacheId: CacheActionPayload['cacheId']) {
        const item = caches.find((e) => e.cacheId === cacheId)
        if (item === undefined) {
          return null
        }
        return item
      },
      onActived(callback, cacheId) {
        cacheDispatch({
          type: CacheActionType.ADD_ACTIVED_CALLBACK,
          payload: {
            cacheId,
            callback,
          },
        })
      },
      onUnActived(callback, cacheId) {
        cacheDispatch({
          type: CacheActionType.ADD_UNACTIVED_CALLBACK,
          payload: {
            cacheId,
            callback,
          },
        })
      },
    }
  }, [caches])
  return (
    <KeepAliveContext.Provider value={contextValue}>
      {children}
      {caches.map((e) => (
        <KeepaliveScopeItem {...e} key={e.cacheId} />
      ))}
    </KeepAliveContext.Provider>
  )
}
export default KeepAliveScope

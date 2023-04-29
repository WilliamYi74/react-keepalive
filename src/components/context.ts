import { KeepAliveItemMergeProps } from '../components/keepalive-item'
import {
  CSSProperties,
  Dispatch,
  ReactElement,
  createContext,
  useContext,
} from 'react'
// 缓存的派发指令
export enum CacheActionType {
  CREATED = 'created' /* 缓存创建 */,
  ACTIVED = 'actived' /* 缓存激活完成 */,
  UNACTIVED = 'unActived' /* 缓存休眠完成 */,
  DESTORYED = 'destoryed' /* 销毁缓存 */,
  CLEAR = 'clear' /* 清除缓存 */,
  UPDATE = 'update' /* 更新组件 */,
  ADD_ACTIVED_CALLBACK = 'addActivedCallback' /* 注册激活回调钩子 */,
  ADD_UNACTIVED_CALLBACK = 'addUnActivedCallback' /* 注册休眠回调钩子 */,
}
export type ReactElementConstructor<P = {}> = (props: P) => ReactElement | null
export type LoadComponentDOM = (currentNode: HTMLDivElement) => void
export type CacheEventListener = (
  callback: CacheEventListenerCallback,
  cacheId: CacheActionPayload['cacheId']
) => void
export type CacheEventListenerCallback = () => void
// 缓存的dispatch载荷类型
export type CacheActionPayload = {
  cacheId: string
  status?: CacheActionType
  children?:
    | ReactElement
    | null
    | ReactElementConstructor<KeepAliveItemMergeProps>
  updater?: {}
  load?: LoadComponentDOM
  onActivedCallbacks?: CacheEventListenerCallback[]
  onUnActivedCallbacks?: CacheEventListenerCallback[]
  parentNodeStyle?: Omit<CSSProperties, 'display'>
}
export type CallbackActionPayload = {
  cacheId: CacheActionPayload['cacheId']
  callback: CacheEventListenerCallback
}
// dispatch类型
export type CacheAction =
  | {
      type: CacheActionType
      payload?: CacheActionPayload
    }
  | {
      type:
        | CacheActionType.ADD_ACTIVED_CALLBACK
        | CacheActionType.ADD_UNACTIVED_CALLBACK
      payload: CallbackActionPayload
    }
// 缓存类型
export type Caches = CacheActionPayload[]
// provider的value类型
export type KeppAliveContextType = {
  caches: Caches
  cacheDispatch: Dispatch<CacheAction>
  getCacheById: (
    cacheId: CacheActionPayload['cacheId']
  ) => null | CacheActionPayload
  onActived: CacheEventListener
  onUnActived: CacheEventListener
}
// reducer类型
export type CacheReducer = (
  prevState: CacheActionPayload[],
  action: CacheAction
) => CacheActionPayload[]
export const cacheReducer: CacheReducer = (prevState, action) => {
  switch (action.type) {
    // 创建指令 创建新的组件缓存
    case CacheActionType.CREATED:
      return [...prevState, action.payload!]
    // 激活指令 更新组件状态为激活
    case CacheActionType.ACTIVED:
      return prevState.map((e) => {
        if (e.cacheId === action.payload?.cacheId) {
          return {
            ...e,
            status: action.payload.status,
            load: action.payload.load,
          }
        }
        return e
      })
    // 休眠指令 更新组件状态为休眠
    case CacheActionType.UNACTIVED:
      return prevState.map((e) => {
        if (e.cacheId === action.payload?.cacheId) {
          return { ...e, status: action.payload.status }
        }
        return e
      })
    // 注册激活钩子回调
    case CacheActionType.ADD_ACTIVED_CALLBACK:
      return prevState.map((e) => {
        if (e.cacheId === action.payload?.cacheId) {
          return {
            ...e,
            onActivedCallbacks: [
              ...e.onActivedCallbacks!,
              (action.payload as CallbackActionPayload).callback,
            ],
          }
        }
        return e
      })
    // 注册休眠钩子回调
    case CacheActionType.ADD_UNACTIVED_CALLBACK:
      return prevState.map((e) => {
        if (e.cacheId === action.payload?.cacheId) {
          return {
            ...e,
            onUnActivedCallbacks: [
              ...e.onUnActivedCallbacks!,
              (action.payload as CallbackActionPayload).callback,
            ],
          }
        }
        return e
      })

    // 更新指令 更新组件children 使用新的updater触发组件更新
    case CacheActionType.UPDATE:
      return prevState.map((e) => {
        if (e.cacheId === action.payload?.cacheId) {
          return {
            ...e,
            children: action.payload.children,
            updater: action.payload.updater,
          }
        }
        return e
      })
    // 销毁指令 当组件存在且为休眠状态时 销毁组件
    case CacheActionType.DESTORYED:
      const item = prevState.find((e) => e.cacheId === action.payload?.cacheId)
      if (item !== null && item?.status === CacheActionType.UNACTIVED) {
        return prevState.filter((e) => e.cacheId !== action.payload?.cacheId)
      }
      return prevState
    // 清空指令 清空当前休眠的组件 已激活的组件不清空
    case CacheActionType.CLEAR:
      return prevState.filter((e) => e.status === CacheActionType.ACTIVED)
    default:
      const type: never = action
      return prevState
  }
}
const KeepAliveContext = createContext<KeppAliveContextType | null>(null)
export default KeepAliveContext

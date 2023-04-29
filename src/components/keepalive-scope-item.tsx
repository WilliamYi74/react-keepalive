import {
  CacheActionPayload,
  CacheActionType,
  ReactElementConstructor,
} from '../components/context'
import { FC, memo, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
export type KeepAliveScopeItemProps = CacheActionPayload
const KeepAliveScopeItem: FC<KeepAliveScopeItemProps> = ({
  children,
  updater,
  status,
  load,
  onActivedCallbacks,
  onUnActivedCallbacks,
  parentNodeStyle,
}) => {
  const currentDom = useRef<HTMLDivElement | null>(null)
  const Comp = useMemo(() => children as ReactElementConstructor, [updater])
  const element = createPortal(
    <div
      ref={currentDom}
      style={{
        ...parentNodeStyle,
        display: status === CacheActionType.ACTIVED ? 'block' : 'none',
      }}
    >
      <Comp />
    </div>,
    document.body
  )
  useEffect(() => {
    // 如果是激活指令则回传DOM到KeepAlive业务组件
    if (status === CacheActionType.ACTIVED) {
      load && load(currentDom.current!)
    }
    // 如果是休眠指令则将DOM放回body里
    if (status === CacheActionType.UNACTIVED) {
      document.body.appendChild(currentDom.current!)
    }
  }, [status])
  useEffect(() => {
    // 如果是激活指令 call激活回调
    if (status === CacheActionType.ACTIVED) {
      onActivedCallbacks?.forEach((callback) => {
        callback && callback()
      })
    }
    // 如果是休眠指令 call休眠回调
    if (status === CacheActionType.UNACTIVED) {
      onUnActivedCallbacks?.forEach((callback) => {
        callback && callback()
      })
    }
  }, [status, onActivedCallbacks, onUnActivedCallbacks])
  return element
}
export default memo(
  KeepAliveScopeItem,
  (prev, next) => prev.status === next.status && prev.updater === next.updater
)

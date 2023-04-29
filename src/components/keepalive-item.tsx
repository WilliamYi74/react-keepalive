import KeepAliveContext, {
  CacheActionPayload,
  CacheActionType,
  CacheEventListener,
  ReactElementConstructor,
} from './context'
import {
  CSSProperties,
  FC,
  cloneElement,
  isValidElement,
  startTransition,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
type KeepAliveItemProps = {
  children?: CacheActionPayload['children']
  cacheId: CacheActionPayload['cacheId']
  parentNodeStyle?: CacheActionPayload['parentNodeStyle']
  containerNodeStyle?: CSSProperties
}
export type KeepAliveItemMergeProps<P = {}> = KeepAliveItemProps & {
  onActived?: CacheEventListener
  onUnActived?: CacheEventListener
} & P
const renderChildren =
  (
    children: KeepAliveItemProps['children'],
    onActived: KeepAliveItemMergeProps['onActived'] = () => {},
    onUnActived: KeepAliveItemMergeProps['onUnActived'] = () => {},
    cacheId: KeepAliveItemProps['cacheId']
  ): ReactElementConstructor<KeepAliveItemMergeProps> =>
  (props) => {
    const mergeProps: KeepAliveItemMergeProps = {
      ...props,
      onActived,
      onUnActived,
      cacheId,
    }
    if (children) {
      if (
        Object.prototype.toString.call(children).slice(8, -1) === 'Function'
      ) {
        return (children as ReactElementConstructor<KeepAliveItemMergeProps>)(
          mergeProps
        )
      } else if (isValidElement(children)) {
        return cloneElement(children, mergeProps)
      } else {
        return null
      }
    }
    return null
  }
export const useCacheDestroy = () => {
  const { cacheDispatch } = useContext(KeepAliveContext)!
  return (cacheId: CacheActionPayload['cacheId']) => {
    cacheDispatch({
      type: CacheActionType.DESTORYED,
      payload: {
        cacheId,
      },
    })
  }
}
const KeepAliveItem: FC<KeepAliveItemProps> = ({
  children,
  cacheId,
  parentNodeStyle = {},
  containerNodeStyle = {},
}) => {
  const contextValue = useContext(KeepAliveContext)!
  const { cacheDispatch, getCacheById, onActived, onUnActived } = contextValue
  const wrapperNode = useRef<HTMLDivElement | null>(null)
  const isFirstRender = useRef(true)
  const load = (currentNode: HTMLDivElement) => {
    wrapperNode.current?.appendChild(currentNode)
  }
  useLayoutEffect(() => {
    startTransition(() => {
      // 组件首次挂载判断如果该组件没有缓存过则派发CREATED指令创建缓存组件
      if (isFirstRender.current && getCacheById(cacheId) === null) {
        cacheDispatch({
          type: CacheActionType.CREATED,
          payload: {
            cacheId: cacheId!,
            status: CacheActionType.CREATED,
            children: renderChildren(
              children,
              onActived.bind(contextValue),
              onUnActived.bind(contextValue),
              cacheId
            ),
            updater: {},
            load,
            onActivedCallbacks: [],
            onUnActivedCallbacks: [],
            parentNodeStyle,
          },
        })
      }
    })
  }, [])
  useLayoutEffect(() => {
    // 页面首次挂载且状态不为休眠时children变化则派发更新指令更新组件缓存
    getCacheById(cacheId!)?.status !== CacheActionType.UNACTIVED &&
      isFirstRender.current &&
      cacheDispatch({
        type: CacheActionType.UPDATE,
        payload: {
          cacheId: cacheId,
          children: renderChildren(
            children,
            onActived.bind(contextValue),
            onUnActived.bind(contextValue),
            cacheId
          ),
          updater: {},
          parentNodeStyle,
        },
      })
  }, [children])
  useEffect(() => {
    // 组件渲染完成后修改首次状态
    isFirstRender.current = false
    // 加载组件派发激活指令
    cacheDispatch({
      type: CacheActionType.ACTIVED,
      payload: {
        cacheId,
        load,
        status: CacheActionType.ACTIVED,
      },
    })
    return () => {
      // 组件销毁前派发休眠指令
      cacheDispatch({
        type: CacheActionType.UNACTIVED,
        payload: {
          cacheId,
          status: CacheActionType.UNACTIVED,
        },
      })
    }
  }, [])
  return <div ref={wrapperNode} style={containerNodeStyle}></div>
}
export default KeepAliveItem

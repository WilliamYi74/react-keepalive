import { KeepAliveItem } from '@williamyi74/react-keepalive/es'
import { useState } from 'react'

const Input = () => {
  return <input />
}
export default function Page1() {
  const [show, setShow] = useState(true)
  return (
    <div>
      <h2>page1</h2>
      {show && (
        <KeepAliveItem key="input" cacheId="input">
          <Input />
        </KeepAliveItem>
      )}
      <button onClick={() => setShow((prev) => !prev)}>
        {show ? '隐藏' : '显示'}
      </button>
    </div>
  )
}

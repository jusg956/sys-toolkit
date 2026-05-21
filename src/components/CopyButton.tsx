import { useState, useCallback } from 'react'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'

interface Props {
  getText: () => string
}

export default function CopyButton({ getText }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = getText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [getText])

  return (
    <div
      onClick={handleCopy}
      style={{
        cursor: 'pointer',
        fontSize: 12,
        color: copied ? '#00E676' : '#6B7B94',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        transition: 'color 0.2s',
      }}
      title="复制信息"
    >
      {copied ? <CheckOutlined /> : <CopyOutlined />}
      {copied && <span style={{ fontSize: 11 }}>已复制</span>}
    </div>
  )
}

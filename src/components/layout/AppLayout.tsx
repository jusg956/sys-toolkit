import type { ReactNode } from 'react'
import { Layout } from 'antd'
import Sidebar from './Sidebar'

const { Sider, Content } = Layout

interface Props {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <Layout style={{ height: '100vh', background: '#080C18' }}>
      <Sider
        width={60}
        breakpoint="lg"
        collapsedWidth={60}
        style={{
          borderRight: '1px solid rgba(0, 212, 255, 0.08)',
          overflow: 'auto',
        }}
      >
        <Sidebar />
      </Sider>
      <Layout style={{ background: '#080C18' }}>
        <Content className="content-scroll">{children}</Content>
      </Layout>
    </Layout>
  )
}

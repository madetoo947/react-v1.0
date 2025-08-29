import React from 'react'
import { Layout } from 'antd'

const { Footer } = Layout

export default function AppFooter() {
  return (
    <Footer style={{ textAlign: 'center' }}>
      Sales Dashboard ©{new Date().getFullYear()}
    </Footer>
  )
}

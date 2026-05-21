import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  algorithm: undefined, // 使用自定义 token 而非内置 dark algorithm
  token: {
    colorPrimary: '#00D4FF',
    colorSuccess: '#00E676',
    colorWarning: '#FF6B35',
    colorError: '#FF3366',
    borderRadius: 10,
    fontFamily: "'DM Sans', 'Microsoft YaHei', -apple-system, sans-serif",
    fontSize: 14,
    colorBgContainer: '#1A2744',
    colorBgLayout: '#080C18',
    colorBgElevated: '#1A2744',
    colorBorder: 'rgba(0, 212, 255, 0.12)',
    colorBorderSecondary: 'rgba(0, 212, 255, 0.08)',
    colorText: '#E0E6ED',
    colorTextSecondary: '#6B7B94',
    colorTextTertiary: '#3D4F6F',
    colorTextQuaternary: '#2A3A54',
    colorFill: 'rgba(0, 212, 255, 0.06)',
    colorFillSecondary: 'rgba(0, 212, 255, 0.04)',
    colorFillTertiary: 'rgba(0, 212, 255, 0.02)',
    controlItemBgHover: 'rgba(0, 212, 255, 0.08)',
  },
  components: {
    Layout: {
      siderBg: '#0E1525',
      headerBg: '#0E1525',
      bodyBg: '#080C18',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(0, 212, 255, 0.1)',
      darkItemColor: '#6B7B94',
      darkItemSelectedColor: '#00D4FF',
      darkItemHoverColor: '#E0E6ED',
      darkItemHoverBg: 'rgba(0, 212, 255, 0.06)',
    },
    Card: {
      colorBgContainer: 'rgba(26, 39, 68, 0.6)',
      colorBorderSecondary: 'rgba(0, 212, 255, 0.12)',
    },
    Button: {
      borderRadius: 8,
      colorBgContainer: 'rgba(26, 39, 68, 0.6)',
      colorBorder: 'rgba(0, 212, 255, 0.2)',
    },
    Statistic: {
      colorTextDescription: '#6B7B94',
      colorText: '#E0E6ED',
    },
    Progress: {
      colorSuccess: '#00E676',
      remainingColor: 'rgba(255, 255, 255, 0.06)',
    },
    Descriptions: {
      colorText: '#E0E6ED',
      colorTextSecondary: '#6B7B94',
      labelColor: '#6B7B94',
    },
    Tag: {
      colorBgContainer: 'rgba(0, 212, 255, 0.1)',
      colorBorder: 'rgba(0, 212, 255, 0.2)',
      colorText: '#00D4FF',
    },
    Spin: {
      colorPrimary: '#00D4FF',
    },
    Tabs: {
      itemColor: '#6B7B94',
      itemActiveColor: '#00D4FF',
      inkBarColor: '#00D4FF',
      itemHoverColor: '#E0E6ED',
    },
    InputNumber: {
      colorBgContainer: 'rgba(26, 39, 68, 0.6)',
      colorBorder: 'rgba(0, 212, 255, 0.12)',
      colorText: '#E0E6ED',
      hoverBorderColor: '#00D4FF',
      activeBorderColor: '#00D4FF',
    },
    Message: {
      contentBg: 'rgba(26, 39, 68, 0.9)',
    },
    Notification: {
      colorBgElevated: 'rgba(26, 39, 68, 0.95)',
    },
  },
}

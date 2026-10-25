import { createVuetify } from 'vuetify'
import { zhHans } from 'vuetify/locale'

export const vuetify = createVuetify({
  locale: {
    locale: 'zhHans',
    fallback: 'zhHans',
    messages: { zhHans }
  },
  theme: {
    defaultTheme: 'adminLight',
    themes: {
      adminLight: {
        dark: false,
        colors: {
          primary: '#6750a4',
          'on-primary': '#ffffff',
          'primary-container': '#eaddff',
          'on-primary-container': '#21005d',
          secondary: '#625b71',
          'secondary-container': '#e8def8',
          surface: '#fffbfe',
          'surface-variant': '#e7e0ec',
          background: '#f7f2fa',
          error: '#ba1a1a',
          warning: '#825500',
          success: '#006a6a'
        }
      }
    }
  },
  defaults: {
    VBtn: { rounded: 'pill', variant: 'flat' },
    VCard: { rounded: 'xl', elevation: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VTextarea: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VDialog: { maxWidth: 640 },
    VDataTable: { density: 'comfortable', hover: true }
  }
})

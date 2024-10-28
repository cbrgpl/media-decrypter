import { createVuetify } from 'vuetify';
import { aliases } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';
import('@mdi/font/css/materialdesignicons.css');

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          'primary': '#E01541',
          'primary-darken-1': '#950E2B',
          'secondary': '#DEA47E',
          'secondary-darken-1': '#C36C32',

          'error': '#F6CD13',
          'info': '#A7ADC6',
          'success': '#0EAD69',
          'warning': '#48ACF0',

          'background': '#141414',
          'surface': '#1F1F1F',
          'surface-bright': '#333333',
          'surface-light': '#5C5C5C',
          'surface-variant': '#130205',
          'on-surface-variant': '#EEEEEE',
        },
      },
    },
  },
});

export { vuetify };

<template>
  <router-view/>
</template>

<script>
  import {defineComponent, inject, provide, toRef, watch, onMounted} from 'vue';
  import {useQuasar, colors} from 'quasar';

  import {useCssVars} from '@sparkz-community/common-client-lib';

  import useAuthStore from 'stores/store.auth';

  import testHostStr from 'src/utils/testHostStr';

  export default defineComponent({
    name: 'App',
    setup() {
      const $lget = inject('$lget');
      const $lisNil = inject('$lisNil');
      const $q = useQuasar();
      const {$removeAllCssVars, $setCssVar} = useCssVars();

      const authStore = useAuthStore();
      const authUser = toRef(authStore, 'authUser');
      provide('authUser', authUser);
      provide('activeLogin', toRef(authStore, 'activeLogin'));
      provide('activeAccount', toRef(authStore, 'activeAccount'));

      watch(authUser, (newVal) => {
        // console.log('user', newVal);
        // this.$removeAllCssVars();
        //
        // let theme = this.$lget(newVal, 'settings.theme');
        // if (theme) {
        //   Object.keys(theme).forEach(k => {
        //     if (k.startsWith('--') && theme[k]) {
        //       this.$setCssVar(k, theme[k]);
        //       let rgb = colors.textToRgb(theme[k]);
        //       let rgbString = `${rgb.r},${rgb.g},${rgb.b}`;
        //       this.$setCssVar(`${k}-rgb`, rgbString);
        //     }
        //   });
        // }

        let darkMode = $lget(newVal, 'settings.theme.darkMode', undefined);
        if (!$lisNil(darkMode)) {
          $q.dark.set(darkMode);
        } else {
          $q.dark.set(false);
        }
      }, {
        deep: true,
        immediate: true,
      });

      function setTheme(theme) {
        $removeAllCssVars();

        if (theme) {
          Object.keys(theme).forEach(k => {
            if (k.startsWith('--') && theme[k]) {
              $setCssVar(k, theme[k]);
              let rgb = colors.textToRgb(theme[k]);
              let rgbString = `${rgb.r},${rgb.g},${rgb.b}`;
              $setCssVar(`${k}-rgb`, rgbString);
            }
          });
        }
      }

      onMounted(() => {
        // depending on host, change the color scheme
        $removeAllCssVars();

        const host = window.location.host;

        if (testHostStr(['taxbox'], process.env.TAXBOX_SITE_DOMAIN, host) || process.env.FIXED_SITE_DOMAIN === 'taxbox') {
          let theme = {
            '--q-primary': '#212F64',
            '--q-secondary': '#C02032',
            '--q-accent': '#879BCB',
          };
          setTheme(theme);
        } else if (testHostStr(['sparkz-experts'], process.env.EXPERTS_SITE_DOMAIN, host) || process.env.FIXED_SITE_DOMAIN === 'sparkz-experts') {
          let theme = {
            '--q-primary': '#4959A8',
            '--q-secondary': '#92683A',
            '--q-accent': '#879BCB',
          };
          setTheme(theme);
        } else if (testHostStr(['website-builder'], process.env.WEBSITE_BUILDER_SITE_DOMAIN, host) || process.env.FIXED_SITE_DOMAIN === 'website-builder') {
          let theme = {
            '--q-primary': '#005586',
            '--q-secondary': '#D88373',
            '--q-accent': '#F5E2C8',
          };
          setTheme(theme);
        } else if (testHostStr(['healthcare'], process.env.HEALTHCARE_SITE_DOMAIN, host) || process.env.FIXED_SITE_DOMAIN === 'healthcare') {
          let theme = {
            '--q-primary': '#03ACF2',
            '--q-secondary': '#4CAF50',
            '--q-accent': '#01579B',
            '--q-darken': '#00000089',
          };
          setTheme(theme);
        }
      });
      return {};
    },
  });
</script>

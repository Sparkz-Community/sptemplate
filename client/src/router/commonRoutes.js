import useAuth from 'stores/store.auth';


// eslint-disable-next-line no-unused-vars
export default function ({store, ssrContext}) {
  return [
    {
      path: 'login',
      name: 'login',
      // eslint-disable-next-line no-unused-vars
      props(route) {
        return {
          attrs: {
            fieldsColor: 'secondary',
            redirectUrl: {
              name: 'home',
            },
            'login-btn-attrs': {
              class: ['shadow-5'],
              color: 'primary',
              'no-caps': false,
            },
            'forgot-password-attrs': {
              'btn-attrs': {
                color: 'accent',
                'no-caps': false,
              },
            },
            'title-attrs': {
              class: 'text-uppercase',
              style: 'font-size: 25px; font-weight: 700;',
            },
          },
          'page-attrs': {
            class: 'q-pa-xl',
            style: {
              background: 'radial-gradient(rgba(0, 0, 0, .1), rgba(0, 0, 0, .5))',
              'background-size': 'cover',
              '-o-background-size': 'cover',
              '-moz-background-size': 'cover',
              '-webkit-background-size': 'cover',
            },
          },
        };
      },
      component: () => import('@sparkz-community/auth-management-client-lib/src/pages/login/baseLogin/loginPage'),
    },
    {
      path: 'register',
      name: 'register',
      // eslint-disable-next-line no-unused-vars
      props(route) {
        return {
          attrs: {
            fieldsColor: 'secondary',
            default_verify_value: ['sms'],
            'title-attrs': {
              class: 'text-uppercase',
              style: 'font-size: 25px; font-weight: 700;',
            },
            'register-btn-attrs': {
              class: ['shadow-5'],
              color: 'primary',
              'no-caps': false,
            },
            'verify-dialog-title-attrs': {
              class: 'bg-primary text-accent text-uppercase q-mb-sm',
            },
            'sentToMessage-attrs': {
              class: 'text-weight-bold text-accent',
              style: 'display: inline-block;',
            },
            'sentToMessage-div-attrs': {
              class: 'text-uppercase',
              style: 'font-size: 25px;',
            },
          },
          'page-attrs': {
            style: {
              background: 'radial-gradient(rgba(0, 0, 0, .1), rgba(0, 0, 0, .5))',
              'background-size': 'cover',
              '-o-background-size': 'cover',
              '-moz-background-size': 'cover',
              '-webkit-background-size': 'cover',
            },
          },
        };
      },
      component: () => import('@sparkz-community/auth-management-client-lib/src/pages/register/baseRegister/registerPage'),
    },
    {
      path: 'verify',
      name: 'verify',
      component: () => import('@sparkz-community/auth-management-client-lib/src/pages/authManagement/verifyEmail/verifyEmailPage'),
    },
    {
      path: 'resetPassword',
      name: 'resetPassword',
      component: () => import('@sparkz-community/auth-management-client-lib/src/pages/authManagement/resetPassword/resetPasswordPage'),
    },
    {
      path: 'verifyAndSetPassword',
      name: 'verifyAndSetPassword',
      component: () => import('@sparkz-community/auth-management-client-lib/src/pages/authManagement/verifyAndSetPassword/verifyAndSetPasswordPage'),
    },
    {
      path: 'changePassword',
      name: 'changePassword',
      component: () => import('@sparkz-community/auth-management-client-lib/src/pages/authManagement/changePassword/changePasswordPage'),
    },

    {
      path: 'logout',
      name: 'logout',
      beforeEnter(to, from, next) {
        let authStore = useAuth();
        authStore.logout()
          // eslint-disable-next-line no-unused-vars
          .then(result => {
            // console.log('logout:', result);
            if (from.path === '/') {
              next({name: 'login'});
            } else {
              next('/');
            }
          })
          .catch(error => {
            console.error('error logout:', error);
            next(from);
          });
      },
    },
  ];
}

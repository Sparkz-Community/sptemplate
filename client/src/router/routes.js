import commonRoutes from './commonRoutes.js';
import {packageRoutes} from '@sparkz-community/common-client-lib';

export default function ({store, ssrContext}) {
  const routes = [
    {
      path: '/',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('pages/IndexPage.vue')
        },
        {
          path: 'my-account/:id?',
          name: 'my-account',
          meta: {requiresAuth: true},
          // beforeEnter(to, from, next) {
          //   if (!store.getters['auth/user']) {
          //     next({name: 'home'});
          //   } else {
          //     next();
          //   }
          // },
          component: () => import('pages/profile/AccountProfile/AccountProfile'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          // meta: {requiresAuth: true},
          component: () => import ('pages/notifications/Notifications.vue'),
        },
        packageRoutes.find(route => route.name === 'quickbooks-connect'),
        ...commonRoutes({store, ssrContext}),
      ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
      path: '/:catchAll(.*)*',
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ];

  return routes;
}

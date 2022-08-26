import commonRoutes from './commonRoutes.js';

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
          path: 'notifications',
          name: 'notifications',
          // meta: {requiresAuth: true},
          component: () => import ('pages/notifications/Notifications.vue'),
        },
        {
          path: 'projects',
          name: 'projects',
          meta: {requiresAuth: true},
          component: () => import('pages/Projects'),
        },
        {
          path: 'WpbEditor/:page_id?',
          name: 'WpbEditor',
          component: () => import('pages/WpbEditor/WpbEditor'),
          props: (route) => {
            return {
              ...route.params,
            };
          },
          meta: {requiresAuth: true},
        },

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

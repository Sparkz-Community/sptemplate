export default function (/*{store, ssrContext}*/) {
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
          path: 'chats',
          name: 'chats',
          meta: {requiresAuth: true},
          component: () => import ('pages/chats/chats.vue'),
        },

        {
          path: 'refer-test',
          name: 'refer-test',
          component: () => import('components/referLinks/referLinkGenerator.vue'),
        },
        {
          path: 'refer',
          name: 'refer',
          component: () => import('pages/referLinks/Refer.vue'),
        },
        {
          path: 'refer-form',
          name: 'refer-form',
          component: () => import('pages/referLinks/ReferForm.vue'),
        },
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

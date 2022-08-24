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
          path: 'boards',
          name: 'boards',
          meta: {requiresAuth: true},
          component: () => import ('pages/taskManager/BoardsPage'),
        },
        {
          path: 'boards/:id',
          name: 'board',
          meta: {requiresAuth: true},
          component: () => import ('pages/taskManager/BoardPage'),
        },
        {
          path: 'board-templates',
          name: 'boardTemplates',
          meta: {requiresAuth: true},
          component: () => import ('pages/taskManager/BoardTemplatesPage'),
        },
        {
          path: 'board-templates/:id',
          name: 'boardTemplate',
          meta: {requiresAuth: true},
          component: () => import ('pages/taskManager/BoardTemplatePage'),
        },
        {
          path: 'board-templates/:id/board-template-lists',
          name: 'boardTemplateLists',
          meta: {requiresAuth: true},
          component: () => import ('pages/taskManager/BoardTemplateListsPage'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          // meta: {requiresAuth: true},
          component: () => import ('pages/notifications/Notifications.vue'),
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

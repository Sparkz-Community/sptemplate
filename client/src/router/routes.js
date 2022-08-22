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
          path: 'balanced-sheets',
          name: 'balanced-sheets',
          meta: {requiresAuth: true},
          component: () => import('pages/qbReports/BalancedSheets/BalancedSheets')
        },
        {
          path: 'profit-and-loss',
          name: 'profit-and-loss',
          meta: {requiresAuth: true},
          component: () => import('pages/qbReports/ProfitAndLoss/ProfitAndLoss')
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

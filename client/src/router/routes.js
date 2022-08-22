
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
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
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;

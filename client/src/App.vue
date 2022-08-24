<template>
  <router-view/>
</template>

<script>
  import {defineComponent, provide, toRef} from 'vue';

  import useAuthStore from 'stores/store.auth';

  export default defineComponent({
    name: 'App',
    setup() {
      const authStore = useAuthStore();
      provide('authUser', toRef(authStore, 'authUser'));
      provide('activeLogin', toRef(authStore, 'activeLogin'));
      provide('activeAccount', toRef(authStore, 'activeAccount'));
      return {};
    },
  });
</script>

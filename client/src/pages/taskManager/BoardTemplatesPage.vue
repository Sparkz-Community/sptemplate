<template>
  <div>
    <boards :model="model" :params="params" @go-to-item="goToBoardTemplate"/>
  </div>


</template>

<script setup>
  import Boards from './components/Boards';
  // import {models} from 'feathers-pinia';
  import {reactive} from 'vue';
  import {BoardTemplates} from 'stores/services/board-templates';
  import {useRouter} from 'vue-router/dist/vue-router';

  const $router = useRouter();
  const model =  BoardTemplates;
  const params = reactive({
    query: {
      // process: {$in: this.$route.params.id},
      $sort: {
        order: 1,
        createdAt: 1,
      },
    },
    $fastJoinShared: true,
    'board-templates_fJoinHookResolversQuery': {
      creator: true,
    },
  });
  function goToBoardTemplate(item) {
    $router.push({name: 'boardTemplate', params: {id: item._id}});
  }
</script>

<style scoped>

</style>

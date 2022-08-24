<template>
  <div>
    <boards :model="model" :params="params" @go-to-item="goToBoard"/>
  </div>


</template>

<script setup>
  import { useRouter} from 'vue-router';
  import Boards from './components/Boards';
  import {models} from 'feathers-pinia';
  import {reactive} from 'vue';
  const $router = useRouter();
  const model =  models.api.Boards;
  const params = reactive({
    query: {
      // process: {$in: this.$route.params.id},
      $sort: {
        order: 1,
        createdAt: 1,
      },
    },
    $fastJoinShared: true,
    'boards_fJoinHookResolversQuery': {
      creator: true,
    },
    boardListResolversQuery: {
      lists: true
    }
  });
  function goToBoard(item) {
    $router.push({name: 'board', params: {id: item._id}});
  }
</script>

<style scoped>

</style>

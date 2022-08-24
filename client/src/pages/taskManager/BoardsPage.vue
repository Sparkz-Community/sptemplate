<template>
  <div>
    <boards :model="model" :params="params"/>
  </div>


</template>

<script setup>
  import Boards from './components/Boards';
  import {models} from 'feathers-pinia';
  import {reactive} from 'vue';
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
</script>

<style scoped>

</style>

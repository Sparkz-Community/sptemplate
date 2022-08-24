<template>
  <div>
    <boards :model="model" :params="params"/>
  </div>


</template>

<script setup>
  import Boards from './components/Boards';
  // import {models} from 'feathers-pinia';
  import {reactive} from 'vue';
  import {BoardTemplates} from 'stores/services/board-templates';
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
</script>

<style scoped>

</style>

<template>
<div>Board</div>
  {{board}}
</template>

<script setup>
  import {useItemLists} from 'pages/taskManager/composables/itemListsComposable';

  const {item: board,} = useItemLists({service: 'board-templates'});

</script>

<style scoped>

</style>

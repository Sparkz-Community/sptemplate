<template>

    <draggable
      v-if="card"
    >
      <q-card class="q-ma-sm">

        <q-card-section>
          {{card.name}}
        </q-card-section>

      </q-card>
    </draggable>

</template>

<script setup>
  import { Draggable} from 'vue3-smooth-dnd';

  defineProps({
    card: {
      type: Object,
      required: true
    },
  });



</script>

<style scoped>

</style>

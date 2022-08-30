<template>
  <div id="addCard" :class="!showForm && [ $q.dark.mode ? 'bg-dark' : 'bg-white']" >
    <q-btn v-if="!showForm"
           flat
           icon="add"
           class="full-width"
           @click.stop="showForm = true"
           @touchstart.stop="showForm = true">
      {{label}}
    </q-btn>
    <q-card  v-else style="width: 100%; margin: 5px 2px 5px 2px; border-radius: 8px;">
      <q-card-actions align="between">
        <p class="text-h4 text-primary q-mx-md">Add Card</p>
        <q-btn dense flat round icon="close" @click.stop="showForm = false" @touchstart.stop="showForm = false"></q-btn>
      </q-card-actions>
      <q-card-section class="flex q-mt-none" style="align-items: center;">
        <slot :name="`form_${list._id}`" :list="list" :close="close">

        </slot>

      </q-card-section>
    </q-card>
  </div>

</template>

<script setup>

  import {ref, defineProps} from 'vue';

  defineProps({
    list: {
      type: Object,
      required: true,
    },
    parentCard: {
      type: Object,
      required: false,
    },
    label: {
      type: String,
      required: false,
      default: () => {return 'New Card';}
    },
  });

  let showForm = ref(false);

  function close() {
    showForm.value = false;
  }

</script>

<style scoped lang="scss">

</style>

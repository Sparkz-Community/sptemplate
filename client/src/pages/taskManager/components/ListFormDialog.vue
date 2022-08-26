<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('@update:modelValue', $event)" position="right">
    <q-layout view="Lhh lpR fff" container :class="$q.dark.mode ? 'bg-dark' : 'bg-white'"
              style="width: 350px">
      <q-header class="bg-primary">
        <q-toolbar>
          <q-toolbar-title>{{ formData['_id'] ? 'Edit' : 'New' }} List</q-toolbar-title>
          <q-btn flat  round dense icon="close" @click="$emit('close')"/>
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-sm">
          <form-generator v-model="formData" :fields="fields"></form-generator>
          <q-toggle v-model="formData.completeCard" label="Completes Card"></q-toggle>
        </q-page>
      </q-page-container>
      <q-footer :class="$q.dark.mode ? 'bg-dark' : 'bg-white'" bordered>
        <q-toolbar class="row justify-between">
          <q-btn color="primary" @click="$emit('save-list',formData)">Save</q-btn>
          <q-btn v-if="initialValue?.value?._id" color="negative" @click="$emit('delete-list',formData)">Delete</q-btn>
        </q-toolbar>
      </q-footer>
    </q-layout>
  </q-dialog>
</template>

<script setup>
  import {computed, ref, watch} from 'vue';
  import useColorStore from 'stores/services/colors';
  import {storeToRefs} from 'pinia/dist/pinia';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    initialValue: {
      type: Object,
      default() {
        return {};
      }
    }
  });

  const colorsStore = useColorStore();

  const {lightSpring} = storeToRefs(colorsStore);
  const formData = ref({});

  watch(props.initialValue,function (newVal) {
    formData.value = newVal.value;
  },{ deep: true, immediate: true});

  const fields = computed(() => [
    {
      fieldType: 'TextInput',
      path: 'name',
      attrs: {
        label: 'name',
        filled: true,
        clearable: true,
        'clear-icon': 'close',
        required: true,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
    {
      fieldType: 'NumberInput',
      path: 'order',
      attrs: {
        min: 1,
        center: true,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
    {
      fieldType: 'ColorPicker',
      path: 'color',
      attrs: {
        palette: lightSpring,
      },
    },
  ]);
</script>

<style scoped>

</style>

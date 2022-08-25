<template>
  <div>
    <q-color
      :model-value="'model-value'"
      @change="$emit('colorPicker', $event)"
      :format-model="format"
      class="my-picker"/>
  </div>
</template>

<script>
  export default {
    name: 'colorPicker',
    mounted() {
      // console.log('color picker value', this.value.value);
    },
    props: {
      format: String,
      'model-value': String
    },
    emits: [
      'colorPicker',
    ],
  };
</script>

<style scoped>

</style>

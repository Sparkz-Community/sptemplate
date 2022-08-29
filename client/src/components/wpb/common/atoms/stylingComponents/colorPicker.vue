<template>
  <div>
    <q-color :modelValue="value"
             @change="$emit('colorPicker', $event)"
             :format-model="format"
             class="my-picker"/>
  </div>
</template>

<script>
  export default {
    name: 'colorPicker',
    props: {
      format: String,
      modelValue: String,
    },
    // mounted() {
    //   console.log('color picker value', this.value.value);
    // },
  };
</script>

<style scoped>

</style>

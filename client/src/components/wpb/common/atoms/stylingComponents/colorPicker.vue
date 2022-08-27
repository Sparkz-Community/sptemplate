<template>
  <div>
    <q-color :value="value"
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
      value: String,
    },
    // mounted() {
    //   console.log('color picker value', this.value.value);
    // },
  };
</script>

<style scoped>

</style>

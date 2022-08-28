<template>
  <div id="GroupFieldsCarousel">
    <pre v-text="attrs"/>
  </div>
</template>

<script>
  export default {
    name: 'GroupFieldsCarousel',
    inheritAttrs: false,
    computed: {
      attrs() {
        let newVal = {...this.$attrs};
        return newVal;
      },
    },
  };
</script>

<style scoped lang="scss" src="./_GroupFieldsCarousel.scss">

</style>

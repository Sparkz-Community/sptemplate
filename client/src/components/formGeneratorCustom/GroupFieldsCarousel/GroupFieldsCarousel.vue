<template>
  <transition v-bind="attrs['transition-attrs']">
    <div id="GroupFieldsCarousel">
      <pre v-text="attrs"/>
    </div>
  </transition>
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

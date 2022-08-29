<template>
  <div :style="{...elementData.styles, position: 'relative'}"
       :id="elementData._id"
       :class="!isEditing ? showBorder ? 'inactive': '' : 'editing'"
       @click.stop="!previewing ? currentElement = {...elementData, treePath, index}:''"
       @mouseenter.stop="hovering = true"
       @mouseleave.stop="hovering = false">
    <editing-options v-if="$lget(currentElement, '_id', false) === $lget(elementData, '_id', true) && !previewing"
                     :type="elementData._type"
                     :parent="$lget(treePath, [0])"
                     @jumpToParent="currentElement = $event"/>
    <q-carousel v-model="slide"
                :style="{...elementData.styles}"
                v-bind="$attrs['attrs']"
                :autoplay="autoplayCheck"
                v-model:fullscreen="elementData.attrs.fullscreen">
      <q-carousel-slide v-for="(img, i) in elementData.slides" :key="i" :name="img.name" :img-src="img.src"/>
    </q-carousel>
  </div>
</template>

<script>
  import {mapWritableState} from 'pinia';

  import {useWpbStore} from 'stores/useWpbStore';

  import editingOptions from 'components/wpb/editingOptions/editingOptions';

  export default {
    name: 'imgCarousel',
    inheritAttrs: false,
    components: {
      editingOptions,
    },
    props: {
      previewing: Boolean,
      element: Object,
      showBorder: Boolean,
      treePath: Array,
      index: [String, Number],
    },
    data() {
      return {
        hovering: false,
        slide: null,
        elementData: {
          attrs: {
            fullscreen: false,
          },
        },
      };
    },
    mounted() {
      this.setVModel();
    },
    watch: {
      element: {
        immediate: true,
        deep: true,
        handler(newVal) {
          if (newVal) {
            this.elementData = {
              attrs: {
                fullscreen: false,
              },
              ...newVal,
            };
          }
        },
      },
    },
    computed: {
      ...mapWritableState(useWpbStore, {
        currentElement: 'currentElement',
      }),
      isEditing() {
        return this.$lget(this.currentElement, '_id', false) === this.$lget(this.element, '_id', true) && !this.previewing;
      },
      slides() {
        return this.elementData.slides;
      },
      autoplayCheck() {
        if (this.$lget(this.elementData, 'attrs.autoplaySwitch', false) === false) {
          return false;
        } else if (this.$lget(this.elementData, 'attrs.autoplaySwitch', false) === true) {
          return this.$lget(this.elementData, 'attrs.autoplay', 2500);
        } else return false;
      },
    },
    methods: {
      setVModel() {
        this.slide = this.$lget(this.elementData, ['slides', 0, 'name'], '');
      },
    },
  };
</script>

<style scoped>

</style>

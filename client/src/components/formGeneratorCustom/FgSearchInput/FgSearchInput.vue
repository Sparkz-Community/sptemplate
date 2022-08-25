<template>
  <div id="FGSearchInput" v-bind="$attrs['div-attrs']">
<!--    <search-input v-bind="$attrs['attrs']"-->
<!--                  :use-email="useEmail"-->
<!--                  :model="model"-->
<!--                  :qid="qid"-->
<!--                  :model-value="'model-value'">-->
<!--      &lt;!&ndash;      @selected="updateForm"&ndash;&gt;-->
<!--      <template v-for="slot in slots"-->
<!--                v-slot:[slot]="slotProps">-->
<!--        <slot :name="slot" v-bind="slotProps"></slot>-->
<!--      </template>-->
<!--    </search-input>-->
  </div>
</template>

<script>
  // import SearchInput from 'pages/messages/components/search-input';
  import { BaseModel } from 'feathers-pinia';

  export default {
    name: 'FGSearchInput',
    inheritAttrs: false,
    components: {
      // SearchInput,
    },
    props: {
      'model-value': {
        type: [Array, String],
      },
      path: {
        required: true,
      },
      model: {
        type: BaseModel,
        required: true,
      },
      qid: {
        required: true,
      },
      useEmail: {
        type: Boolean,
        default: false,
      },
      slots: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {};
    },
    watch: {
      $attrs: {
        immediate: true,
        deep: true,
        handler(newVal) {
          // attrs defaults
          this.$lset(newVal, 'attrs.label', this.$lget(newVal, 'attrs.label', 'label'));

          // div-attrs defaults
          this.$lset(newVal, 'div-attrs.class', this.$lget(newVal, 'div-attrs.class', 'col-12 col-sm-6'));
        },
      },
    },
    computed: {},
    methods: {},
  };
</script>

<style scoped lang="scss" src="./_FGSearchInput.scss">

</style>

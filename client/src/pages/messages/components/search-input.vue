<template>
  <q-select v-bind="$attrs"
            :options="serviceItems"
            :model-value="modelValue"
            use-input
            @update:model-value="setModel"
            @filter="filterFn"
            new-value-mode="add-unique"
            @new-value="$emit('add', $event)">
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </q-select>
</template>

<script>
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {computed, inject, ref, toRef} from 'vue';

  export default {
    name: 'search-input',
    inheritAttrs: false,
    props: {
      model: {
        required: true,
      },
      qid: String,
      path: {
        type: String,
        default: 'auto',
      },
      customQuery: {
        type: Object,
        default() {
          return {};
        },
      },
      useEmail: {
        type: Boolean,
        default: true,
      },
      searchField: {
        type: String,
        default: 'name',
      },
      modelValue: {
        type: [Array, String],
        default() {
          return [];
        },
      },
    },
    setup(props) {
      const $lmerge = inject('$lmerge');
      const qid = toRef(props, 'qid');
      const localQuery = ref({});
      const customQuery = toRef(props, 'customQuery');

      const query = computed(() => {
        // if (!['', null, undefined].includes(this.search)) {
        //   this.$lset(query, '$or', [
        //     {
        //       name: {$regex: `${this.search}`, $options: 'igm'},
        //     },
        //     {
        //       email: {$regex: `${this.search}`, $options: 'igm'},
        //     },
        //   ]);
        // }
        return $lmerge({
          $sort: {
            name: 1,
          },
        }, localQuery.value, customQuery.value);
      });

      const params = computed(() => {
        return {
          debounce: 500,
        };
      });

      const {currentPage, items: serviceItems, error} = useFindPaginate({
        limit: ref(6),
        model: props.model,
        qid: qid,
        infinite: ref(true),
        query: query,
        params: params,
      });

      return {
        error,
        localQuery,
        currentPage,
        serviceItems,
      };
    },
    emits: [
      'update:model-value',
      'add',
    ],
    data() {
      return {
        sort: undefined,
        search: '',
      };
    },
    // mounted() {
    //   console.log(this.$attrs);
    // },
    methods: {
      dataScroll() {
        this.currentPage += 1;
      },
      filterFn(val, update) {
        update(() => {
          const $search = val.toLocaleLowerCase();
          this.localQuery = this.useEmail ? {
            email: {$regex: `${$search}`, $options: 'igm'},
            name: {$regex: `${$search}`, $options: 'igm'},
          } : {
            [`${this.searchField}`]: {$regex: `${$search}`, $options: 'igm'},
          };
        });
      },
      setModel(val) {
        this.$emit('update:model-value', val);
      },
    },
  };
</script>

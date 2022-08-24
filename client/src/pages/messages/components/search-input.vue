<template>
  <q-select v-bind="$attrs"
            :options="this['data']"
            :model-value="'model-value'"
            use-input
            @update:model-value="setModel"
            @filter="filterFn"
            new-value-mode="add-unique"
            @new-value="$emit('add', $event)">
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope"/>
    </template>
  </q-select>
</template>

<script>
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {BaseModel} from 'feathers-pinia';

  export default {
    name: 'search-input',
    inheritAttrs: false,
    setup(props) {
      useFindPaginate({
        limit: 6,
        model: props.model,
        qid: props.qid,
        infinite: true,
        query() {
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
          return this.$lmerge({
            $sort: {
              name: 1,
            },
          }, this.localQuery, props.customQuery);
        },
        params() {
          return {
            qid: this.qid,
            debounce: 500,
            [`${props.model.servicePath}_fJoinHookResolversQuery`]: this.fastJoinResolverQuery,
          };
        },
      });

      return {
        useFindPaginate,
      };
    },
    props: {
      model: {
        type: BaseModel,
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
      'model-value': {
        type: [Array, String],
        default() {
          return [];
        },
      },
    },
    emits: [
      'update:model-value',
      'add',
    ],
    mixins: [],
    data() {
      return {
        sort: undefined,
        search: '',
        localQuery: {},
      };
    },
    mounted() {
      console.log(this.$attrs);
    },
    methods: {
      dataScroll() {
        this[`${this.service}CurrentPage`] += 1;
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

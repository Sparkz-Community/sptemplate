<template>
  <q-page>
    <p>pinia users:</p>
    <ol>
      <li v-for="(user, index) in users" :key="index">{{ user.name }}</li>
    </ol>
    <q-pagination :model-value="currentPage"
                  @update:model-value="toPage"
                  :max="pageCount"
                  :max-pages="6"
                  direction-links
                  boundary-links></q-pagination>
<!--    <form-generator v-model="formData" :fields="fields"></form-generator>-->
  </q-page>
</template>

<script>
  import { defineComponent, computed, reactive, watch } from 'vue';
  import { useQuasar } from 'quasar';
  import { useFind, usePagination } from 'feathers-pinia';

  import useUsers from 'stores/services/users';

  export default defineComponent({
    name: 'IndexPage',
    setup() {
      const $q = useQuasar();

      const usersStore = useUsers();

      const pagination = reactive({ $limit: 1, $skip: 0 });

      const usersParams = computed(() => {
        return {
          query: {
            ...pagination,
          },
          qid: 'users',
          paginate: true,

          rulesJoin: true,
          usersResolversQuery: {
            logins: [undefined, {
              loginsResolversQuery: {
                accounts: true,
              },
            }],
          },
        };
      });

      const { items: users, latestQuery, isPending, ...meta } = useFind({
        model: usersStore.Model,
        params: usersParams,
      });
      watch(isPending, (newVal) => {
        if (newVal) {
          $q.loading.show();
        } else {
          $q.loading.hide();
        }
      }, {immediate: true});

      const {
        // next,
        // prev,
        // canNext,
        // canPrev,
        currentPage,
        // itemsCount,
        pageCount,
        toPage,
        // toStart,
        // toEnd
      } = usePagination(pagination, latestQuery);

      return {
        pagination,
        meta,
        usersParams,
        latestQuery,
        isPending,
        users,
        currentPage,
        pageCount,
        toPage,
      };
    },
    data() {
      return {
        formData: {},
      };
    },
    computed: {
      fields() {
        return [
          {
            fieldType: 'GoogleAddressInput',
            path: 'google',
            attrs: {},
          },
          // {
          //   fieldType: 'GroupConditionalFields',
          //   path: 'conditionals',
          // },
          // {
          //   fieldType: 'GroupFieldsCarousel',
          //   path: 'carousel',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'GroupFieldsDialog',
          //   path: 'dialog',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'GroupFieldsExpansion',
          //   path: 'expansion',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'GroupLayoutDialog',
          //   path: 'layoutDialog',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'PlacesAutoComplete',
          //   path: 'places',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'PlacesAutoCompleteBox',
          //   path: 'placesBox',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'SocialLinkPicker',
          //   path: 'social',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'CountedByListSelect',
          //   path: 'counted',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'DragUpload',
          //   path: 'drag',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'FontPicker',
          //   path: 'fontPick',
          //   attrs: {
          //     apiKey: 'https://fonts.googleapis.com/css2',
          //     defaultFamily: 'Open Sans',
          //     options: {
          //       pickerId: 'testPicker',
          //     },
          //   },
          // },
          // {
          //   fieldType: 'IconPicker',
          //   path: 'iconPick',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'PriceListSelect',
          //   path: 'price',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'SelectOrAdd',
          //   path: 'selectOrAdd',
          //   attrs: {},
          // },
          // {
          //   fieldType: 'TagPicker',
          //   path: 'tag',
          //   attrs: {},
          // },
        ];
      },
    },
  });
</script>

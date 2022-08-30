<template>
  <div class="q-pa-xl" style="width: 65vw; margin: auto">
    <q-card class="q-pa-lg">
      <!--    stuff above is to simulate being in a page (remove when component is done)-->
      <div id="referLinkGenerator">
        <div v-if="referLinks.length">
          <h3 class="q-ma-none q-mb-lg">Your referral links</h3>
          <div v-for="(link, index) in referLinks" :key="index">
<!--            <p v-if="link.subjectName === 'accounts'" class="q-mb-sm">-->
<!--              Personal referral link-->
<!--            </p>-->
            <p class="q-mb-sm">
              {{ $lget(link, 'usedFor') ? $lget(link, 'routeName') : '' }}
              {{ $lget(link, 'usedFor') }}
            </p>
            <div class="flex items-center q-mb-lg"
                 style="border: 1px solid var(--q-primary); border-radius: 5px; overflow: hidden">
              <input style="border: none; flex: 1; height: 35px; font-size: 20px"
                     :ref="`link${index}`"
                     type="text" readonly
                     :value="`${host}/refer?referlink=${link._id}`"/>
              <button class="copy-link-btn cursor-pointer"
                      style="border: none; height: 35px; width: 35px" @click="copyLink(`link${index}`)">
                <q-icon name="mdi-content-copy"/>
                <q-tooltip anchor="bottom middle" self="top middle">
                  Copy Link
                </q-tooltip>
              </button>
            </div>
<!--            stats below each link (number of people that have used the link, etc.)-->
          </div>
        </div>

        <!--        if they've already created all types available, don't show the form?-->
        <h3 class="q-ma-none q-mb-lg">Create link</h3>
        <form-generator v-model="formData" :fields="fields" useQform v-model:valid="valid"></form-generator>
        <div class="flex justify-center items-center q-my-lg">
          <q-btn :disable="!valid"
                 :loading="isCreatePending"
                 rounded
                 color="primary"
                 label="Generate Link"
                 @click="generateLink"/>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>
  import {models} from 'feathers-pinia';
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {mapState} from 'pinia';

  import useReferLinks from 'stores/services/refer-links';
  import { ReferLinks } from 'stores/services/refer-links';
  import {computed, inject, ref} from 'vue';

  export default {
    name: 'referLinkGenerator',
    setup() {
      const $lget = inject('$lget');
      const activeAccount = inject('activeAccount');

      const query = computed(() => {
        return {
          _id: {
            $in: $lget(activeAccount.value, 'referLinks', []),
          }
        };
      });
      const params = computed(() => {
        return {
          paginate: false,
        };
      });

      const {items: referLinks, error} = useFindPaginate({
        model: ReferLinks,
        qid: ref('referLinksList'),
        infinite: ref(true),
        query,
        params,
      });

      return {
        referLinks,
        error,
        query,

        activeAccount,
      };
    },
    data() {
      return {
        formData: new models.api.ReferLinks(),
        valid: false,
        host: window.location.host,
      };
    },
    computed: {
      ...mapState(useReferLinks, {
        isCreatePending: 'isCreatePending',
      }),

      fields() {
        return [
          {
            fieldType: 'SelectInput',
            path: 'usedFor',
            attrs: {
              label: 'What is the link for?',
              'hide-selected': false,
              'fill-input': false,
              'dropdown-icon': 'fas fa-chevron-down',
              options: ['form', 'page'],
              rules: [val => !!val || 'Field is required'],
            },
            'div-attrs': {
              class: 'col-12',
            },
          },
          {
            fieldType: 'GroupConditionalFields',
            path: '',
            return_object_no_key: true,
            conditions: val => val.usedFor === 'page' ? ['routeName'] : [],
            templateFormFields: [
              {
                fieldType: 'SelectInput',
                path: 'routeName',
                attrs: {
                  label: 'What page?',
                  'hide-selected': false,
                  'fill-input': false,
                  'dropdown-icon': 'fas fa-chevron-down',
                  options: ['home'],
                  rules: [val => !!val || 'Field is required'],
                },
                'div-attrs': {
                  class: 'col-12',
                },
              },
            ],
          },
          // another groupConditionalFields for forms
          // They can select from a list of (pre-made forms? or forms they've created?)
          // probably just pre-made forms for the time being.
          {
            fieldType: 'SelectInput',
            path: 'subjectName',
            attrs: {
              label: 'Who\'s referring this item?',
              // label: 'Who\'s getting credit for this referral?',
              'hide-selected': false,
              'fill-input': false,
              'dropdown-icon': 'fas fa-chevron-down',
              'emit-value': true,
              'map-options': true,
              options: [
                {
                  value: 'accounts',
                  label: 'Myself',
                },
              ],
              rules: [val => !!val || 'Field is required'],
            },
            'div-attrs': {
              class: 'col-12',
            },
          },
        ];
      },
    },
    methods: {
      generateLink() {
        this.$lset(this.formData, 'subjectId', this.activeAccount._id);

        this.formData.create()
          .then(() => {
            this.formData = new models.api.ReferLinks();
            this.$q.notify({
              type: 'positive',
              message: 'Link Generated',
              timeout: 10000,
              actions: [
                {
                  icon: 'close',
                  color: 'white',
                  handler: () => {
                  },
                },
              ],
            });
          })
          .catch(err => {
            this.$q.notify({
              type: 'negative',
              message: err.message,
              timeout: 30000,
              actions: [
                {
                  icon: 'close', color: 'white', handler: () => {
                    /* ... */
                  },
                },
              ],
            });
          });
      },

      async copyLink(linkRef) {
        await navigator.clipboard.writeText(this.$refs[linkRef][0]._value);
        this.$q.notify({
          type: 'positive',
          message: 'Link Copied!',
          timeout: 10000,
          actions: [
            {
              icon: 'close', color: 'white', handler: () => {
                /* ... */
              },
            },
          ],
        });
      },
    },
  };
</script>

<style scoped lang="scss">
  #referLinkGenerator {
    .copy-link-btn {
      transition: all 150ms ease-out;

      &:hover {
        background-color: var(--q-primary);
        color: white;
      }
    }
  }
</style>

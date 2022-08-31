<template>
  <div>
    <q-tabs
      style="width: 100%;"
      class="q-px-md"
      v-model="tab"
      dense
      active-color="primary"
      indicator-color="primary"
      narrow-indicator
    >
      <q-tab v-for="opt in options" :name="opt.name" :label="opt.label" :key="opt.name"/>
    </q-tabs>

    <q-separator/>
    <q-tab-panels v-model="tab" animated style="width: 100%;">
      <q-tab-panel name="new">
        <q-input v-model="card.name" dense type="textarea" filled autogrow autofocus style="width: 100%;"/>
      </q-tab-panel>
      <q-tab-panel name="select">

        <select-input v-model="card"
                      @input-value="search = $event"
                      path="auto"
                      :attrs="selectAttrs"
        >
          <template v-slot:append>
            <q-icon name="search"/>
          </template>

          <template v-slot:after-options v-if="cards.length < cardsTotal">
            <q-item>
              <q-item-section @click="this.cardsCurrentPage += 1;">
                <div>
                  <div>Load More
                    <q-icon name="add" size="sm"/>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </template>
        </select-input>
      </q-tab-panel>
    </q-tab-panels>
                <div class="row justify-center full-width q-ma-md">
              <q-btn
                class="full-width"
                icon="add"
                dense color="primary"
                :disable="disableSaveCard"
                @click.stop="save" @touchstart.stop="save"
              >
                Save
              </q-btn>
            </div>
  </div>
</template>

<script>

  import SelectInput
    from '@sparkz-community/form-gen-client-lib/src/components/common/atoms/SelectInput/SelectInput';
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {models} from 'feathers-pinia';
  import {computed, ref, /*toRef*/} from 'vue';


  export default {
    name: 'AddBoardCardForm',
    props:{
      boardId: {
        type: String,
        required: true
      }
    },
    emits: [
      'create-card',
    ],
    setup(props) {

      // const boardId = toRef(props, 'boardId');
      const query = computed(() => {
        return {
          $sort: {
            name: 1,
          },
          'boards.id': {
            $ne: props.boardId,
          },
        };
      });

      const params = computed(() => {
        return {
          debounce: 2000,
        };
      });

      const {
        items: cards,
        itemsCount: cardsTotal,
        currentPage: cardsCurrentPage,
      } = useFindPaginate({
        limit: ref(6),
        model: models.api.Cards,
        qid: ref('searchCards'),
        infinite: ref(true),
        query,
        params,
      });

      return {
        cards,
        cardsTotal,
        cardsCurrentPage,
      };
    },
    components: {
      SelectInput,
    },
    data() {
      return {
        search: '',
        tab: 'new',
        disableSaveCard: true,
        showForm: false,
        options: [
          {
            name: 'new',
            label: 'New Card',
          },
          {
            name: 'select',
            label: 'Existing Card',
          },
        ],
        card: new models.api.Cards(),
      };
    },
    watch: {
      card: {
        immediate: true,
        deep: true,
        handler(newVal) {
          this.disableSaveCard = !this.$lget(newVal,'name');
        },
      },
    },
    computed: {
      selectAttrs() {
        return {
          label: 'Search For Cards Here...',
          // eslint-disable-next-line no-unused-vars
          filterFn(val, update, abort) {
            update(() => {
            });
          },
          slots: ['append', 'after-options', 'option'],
          'fill-input': true,
          hint: 'Search Cards From other Boards',
          'map-options': true,
          // 'option-value': '_id',
          'option-label': 'name',
          // Uncomment below when group chat is needed
          clearable: false,
          multiple: false,
          filled: true,
          dense: true,
          autofocus: true,
          behavior: 'menu',
          style: 'width: 100%;',
          options: this.cards,//Object.freeze(.slice(0)),
        };
      },
    },
    methods: {
      save() {
        this.$emit('create-card',{card: this.card,tab: this.tab});
      }
    }
  };
</script>

<style scoped>

</style>

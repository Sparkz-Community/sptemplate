<template>
  <q-page>
    <lists
      v-if="boardTemplate"
      cards-path="cards"
      :model-value="boardTemplate"
      @add-list="addList"
      @update:model-value="updateItem"
      @@add-card="addCardToList"
      @get-card-payload="getCardPayload"
      @card-dropped="handleCardDrop"

    >
      <template #update-name>
        <q-input v-model="boardTemplate.name" @keyup.enter="updateItem({name: boardTemplate.name})"
                 borderless
                 class="title text-h3"
                 :style="`width: ${boardTemplate?.name?.length + 1}ch`">
        </q-input>
      </template>

      <template #left-control="item">
        <div class="dropdown">
          <q-btn
            color="primary"
            label="Create Board From Template"
            @click="open_create_board = true"
          />
          <q-slide-transition id="dia">
            <q-card v-if="open_create_board" class="menu-body" square>
              <!--            <q-linear-progress :value="1"  />-->

              <q-card-section class="items-center no-wrap column q-gutter-sm q-pa-lg">
                <q-input outlined v-model="boardTitle" label="Title" dense class="full-width text-caption"/>
                <number-input path="order" :min="1" center v-model="boardOrder" class="full-width"/>
                <q-checkbox v-model="keepCards" label="Keep template cards"/>
                <!--              <p class="text-caption q-mt-sm">Comments and creator will not be copied to the new board.</p>-->
              </q-card-section>
              <q-separator/>
              <q-card-actions align="between">
                <q-btn flat label="close" @click="open_create_board=false"/>
                <q-btn :disabled="creatingBoard" :loading="creatingBoard" no-caps color="primary" label="create"
                       @click="createBoardFromTemplate(item)"/>

              </q-card-actions>
            </q-card>

          </q-slide-transition>
        </div>
      </template>
      <template v-for="list in boardTemplate.lists" #[`form_${list._id}`]="{close}" :key="list._id">
        <add-template-card-form
          @create-card="addCardToList({list,...$event, close})"
        />
      </template>
    </lists>
  </q-page>
</template>

<script setup>
  import Lists from 'pages/taskManager/components/Lists';
      // import Card from 'pages/taskManager/components/Card';
  import {useItemLists} from 'pages/taskManager/composables/itemListsComposable';
  import {ref, inject, watch} from 'vue';
  import {models} from 'feathers-pinia';
  import {useRouter} from 'vue-router/dist/vue-router';
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {Boards} from 'stores/services/boards';
  import {useQuasar} from 'quasar';
  import {getMaxOrder, moveItem} from 'pages/taskManager/utils';
  import AddTemplateCardForm from 'pages/taskManager/components/AddTemplateCardForm';

  const $router = useRouter();
  const $q = useQuasar();

  const $lget = inject('$lget');
      // const $lisEqual = inject('$lisEqual'); //
  const open_create_board = ref(false);
  const keepCards = ref(true);
  const creatingBoard = ref(false);
  const boardTitle = ref('');
  const boardOrder = ref(0);

  const {items: boards} = useFindPaginate({
    qid: ref('boards'),
    infinite: ref(true),
    model: Boards,
    query: {},
    params: {
      debounce: 2000,
    },
  });
  const {item: boardTemplate, addList, updateItem} = useItemLists({service: 'board-templates'});


  watch(boards, (newVal) => {
    boardOrder.value = getMaxOrder(newVal) + 1;
  }, {immediate: true, deep: true});


  async function createBoardFromTemplate(boardTemplate) {
    try {
      // create b
      const data = {
        ...boardTemplate,
        name: boardTitle.value,
        order: boardOrder.value,
        boardTemplate: $lget(boardTemplate, '_id'),
      };

      delete data.boards;
      delete data._fastjoin;
      delete data._id;
      const cardsToAdd = [];
      data.lists.map(list => {
        list.cards.forEach(card => {
          cardsToAdd.push(card);
        });
        list.order += 1;
        return list;
      });

      creatingBoard.value = true;
      const boardToSave = new models.api.Boards({...data, lists: [...data.lists.map(lst => ({...lst, cards: []}))]});

      const addCardsInSequence = async (boardId) => {

        try {
          for (let crd of cardsToAdd) {
            delete crd._id;
            const {total, data} = await models.api.Cards.find({
              query: {
                ...crd,
              },
            });
            let crdAdded;

            if (total) {

              crdAdded = await data[0].save({
                data: {
                  $addToSet: {
                    boards: {
                      id: boardId,
                      currentList: $lget(crd, ['list']),
                    },
                  },
                },
              });
            } else {
              crdAdded = await new models.api.Cards({
                ...crd,
                boards: [{
                  id: boardId,
                  currentList: $lget(crd, ['list']),
                }],
              }).save();
            }

            console.log(`Added ${crdAdded}`);
          }
        } catch (err) {
          console.log({err});
        }

      };


      const [savedBoard] = await Promise.all([
        boardToSave.save(),
        boards.value.filter(item => item.order >= boardToSave.order).map(item => item.save({data: {order: (item.order + 1)}})),
      ]);

      if (keepCards.value) {
        await addCardsInSequence(savedBoard._id);
      }
      console.log({savedBoard});
      creatingBoard.value = false;
      await $router.push({name: 'board', params: {id: $lget(savedBoard, '_id')}});
      open_create_board.value = false;
    } catch (err) {
      $q.notify({
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
    }
  }


  function getCardPayload(list) {
    return index => {
      return list.cards.find(card => {
        console.log({list});
        return card.order === (index);
      });
    };
  }


      /* async function addCardToList({list,card,close}) {
console.log({list, card});
try {
const cardsOnList = $lget(list,['cards'],[]);
card.order = $lget(card,['order'],getMaxOrder(cardsOnList));
card.list = $lget(list, '_id');

const id = $lget(boardTemplate.value,'_id');
const res =
await new models.api.BoardTemplates(boardTemplate.value)
.patch(id,
 { $addToSet: {
   'lists.$.cards': card
 }},{
   query: {
     'lists._id' : $lget(list,'_id')
   }
 }
);
console.log(res);
close();

} catch (e) {
$q.notify({
type: 'negative',
message: e.message,
timeout: 30000,
actions: [
{
icon: 'close', color: 'white', handler: () => {
/!* ... *!/
},
},
],
});
}
}
*/

  async function  handleCardDrop(dropResult) {
    const {removedOrder, addedOrder, card, newList, oldList} = dropResult;
    if (newList._id === oldList._id) {
      moveItem(removedOrder, addedOrder, card, newList.cards);
      const {lists} = boardTemplate.value;
      await updateItem({lists});
    } else {
      const {lists} = boardTemplate.value;

      const newLists = lists.map(list => {
        const {cards} = list;

        if (list._id === newList._id) {
          card.order =  addedOrder;
          list.cards = [card, ...cards.map(crd => {
            if (crd.order >=  addedOrder) {
              crd.order += 1;
            }
            return crd;
          })];
        }
        if (list._id === oldList._id) {

          list.cards = cards.filter(crd => crd._id !== card._id).map(crd => {
            if (crd.order > removedOrder) {
              crd.order -= 1;
            }
            return crd;
          });
        }
        return list;
      });
      await updateItem({lists: newLists});
    }

  }
</script>
<script>
  import {mapActions} from 'pinia';
  import useBoardTemplates from 'stores/services/board-templates';
  // import { moveItem} from 'pages/taskManager/utils';

  export default {
    methods: {
      ...mapActions(useBoardTemplates, {
        patchBoardTemplate: 'patch',
      }),
      async addCardToList({list, card, close}) {
        try {
          const cardsOnList = this.$lget(list, ['cards'], []);
          card.order = this.$lget(card, ['order'], this.getMaxOrder(cardsOnList));
          card.list = this.$lget(list, '_id');

          const id = this.$lget(this.boardTemplate, '_id');
          this.boardTemplate = await this.patchBoardTemplate(
            id,
            {$addToSet: {'lists.$.cards': card}},
            {query: {'lists._id': this.$lget(list, '_id')}},
          );
          close();
        } catch (e) {
          this.$q.notify({
            type: 'negative',
            message: e.message,
            timeout: 30000,
            actions: [
              {
                icon: 'close', color: 'white', handler: () => {
                  /* ... */
                },
              },
            ],
          });
        }
      },
      /* async  handleCardDrop(dropResult) {
        const {removedIndex, addedIndex, card, newList, oldList} = dropResult;
        if (newList._id === oldList._id) {
          const removedOrder = removedIndex + 1;
          const addedOrder = addedIndex + 1;
          moveItem(removedOrder, addedOrder, card, newList.cards);
          const {lists} = this.boardTemplate;
          await this.updateItem({lists});
        } else {
          const {lists} = this.boardTemplate;
          const newLists = lists.map(list => {
            const {cards} = list;

            if (list._id === newList._id) {
              card.order = addedIndex + 1;
              list.cards = [card, ...cards.map(crd => {
                if (crd.order >= card.order) {
                  crd.order += 1;
                }
                return crd;
              })];
            }
            if (list._id === oldList._id) {

              list.cards = cards.filter(crd => crd._id !== card._id).map(crd => {
                if (crd.order > card.order) {
                  crd.order -= 1;
                }
                return crd;
              });
            }
            return list;
          });
          console.log({newLists,removedIndex});
          await this.updateItem({lists: newLists});
        }

      }*/
    },
  };
</script>

<style scoped lang="scss">
  .dropdown {
    position: relative;
    max-height: 40rem;

    #dia {
      position: absolute;
      right: 0;
      left: 0;
      z-index: 1;
    }
  }
</style>

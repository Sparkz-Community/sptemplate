<template>
  <q-page>
    <lists v-if="boardTemplate" v-model="boardTemplate">
      <template #update-name>
        <q-input v-model="boardTemplate.name" @keyup.enter="changeName"
                 borderless
                 class="title text-h3"
                 :style="`width: ${boardTemplate?.name?.length + 1}ch`">
        </q-input>
      </template>

      <template #left-control="{item}">
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

    </lists>
  </q-page>
</template>

<script setup>
  import Lists from 'pages/taskManager/components/Lists';
  import {useItemLists} from 'pages/taskManager/composables/itemListsComposable';
  import {ref, inject, watch} from 'vue';
  import {models} from 'feathers-pinia';
  import {useRouter} from 'vue-router/dist/vue-router';
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {Boards} from 'stores/services/boards';
  import {useQuasar} from 'quasar';
  import {getMaxOrder} from 'pages/taskManager/utils';

  const $router = useRouter();
  const $q = useQuasar();

  const $lget = inject('$lget');
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
    }
  });
  const {item: boardTemplate, changeName} = useItemLists({service: 'board-templates'});

  watch(boardTemplate, async (newVal) => {
    if($lget(newVal,'_id')) {
      await new models.api.BoardTemplates(newVal).save();
    }
  }, {immediate: true, deep: true});

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

        try{
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
      console.log('oooo',{savedBoard});
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

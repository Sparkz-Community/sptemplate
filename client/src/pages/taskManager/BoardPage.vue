<template>
  <q-page>
    <lists
      v-if="board"
      cards-path="_fastjoin.cards"
      :model-value="board"
      @add-list="addList"
      @update:model-value="updateItem"
      @add-card="addCardToList"
      @get-card-payload="getCardPayload"
      @card-dropped="handleCardDrop"
      @delete-card="handleDeleteCard"
      @save-card="handleEditCard"
    >
      <template #update-name>
        <q-input v-model="board.name" @keyup.enter="updateItem({name: board.name})"
                 borderless
                 class="title text-h3"
                 :style="`width: ${board?.name?.length + 1}ch`">
        </q-input>
      </template>

      <template v-for="list in board.lists" #[`form_${list._id}`]="{close}" :key="list._id">
        <pre>{{board._id}}</pre>
        <add-board-card-form :board-id="board._id"
                             @create-card="addCardToList({list,...$event, close})" />
      </template>
    </lists>
  </q-page>
</template>

<script setup>
  import Lists from 'pages/taskManager/components/Lists';
  import AddBoardCardForm from 'pages/taskManager/components/AddBoardCardForm';
  import useCards from 'stores/services/cards';

  import {useItemLists} from 'pages/taskManager/composables/itemListsComposable';
  import {computed, inject} from 'vue';
  import {useQuasar} from 'quasar';
  import {getMaxOrder} from 'pages/taskManager/utils';
  import {models} from 'feathers-pinia';

  const $lget = inject('$lget');
  const $lset = inject('$lset');
  const $q = useQuasar();

  const params = computed(() => {
    return {
      boardListResolversQuery: {
        lists: true,
      },
    };
  });

  const {item: board, addList, updateItem, getCardPayload, itemParams: boardParams} = useItemLists({service: 'boards', params});

  async function addCardToList({list, close, card, tab}) {
    try {
      const order = $lget(card, ['order']);
      const cardsOnList = $lget(list,['_fastjoin','cards'],[]);
      if (!order) {
        let newOrder = getMaxOrder(cardsOnList);
        $lset(card, 'order', newOrder);
      }

      let result, boards = {
        id: $lget(board.value, '_id'),
        currentList: $lget(list, '_id'),
      };
      if (tab === 'new') {
        result = await new models.api.Cards({...card, boards}).save();
      } else {
        const cardStore = useCards();
        result = await cardStore.patch(
          card._id,
          {
            $addToSet: {
              boards,
            },
          },
          boardParams,
        );
        /*result = await cardToSave.save(
          {
            data: {
              $addToSet: {
                boards,
              },
            },
            ...boardParams,
          },
        );*/
      }
      close();
      $q.notify({
        type: 'positive',
        message: `Successfully Sent added ${$lget(result, 'name')} card to ${$lget(list, 'name')} list`,
      });
    } catch (e) {
      $q.notify({
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
  }

  function handleCardDrop(dropResult) {
    console.log(dropResult);
  }

  function handleDeleteCard(val) {
    console.log(val);
  }

  function handleEditCard(val) {
    console.log(val);
  }

</script>

<style scoped>

</style>

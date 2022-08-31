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
      @restore-from-recycle="handleRestoreFromRecycle"
    >
      <template #update-name>
        <q-input v-model="board.name" @keyup.enter="updateItem({name: board.name})"
                 borderless
                 class="title text-h3"
                 :style="`width: ${board?.name?.length + 1}ch`">
        </q-input>
      </template>

      <template v-for="list in board.lists" #[`form_${list._id}`]="{close}" :key="list._id">

        <add-board-card-form :board-id="board._id"
                             @create-card="addCardToList({list,...$event, close})"/>
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
  const authUser= inject('authUser');
  const activeAccount = inject('activeAccount');

  const $q = useQuasar();

  const cardStore = useCards();

  const params = computed(() => {
    return {
      boardListResolversQuery: {
        lists: true,
      },
    };
  });

  const {item: board, addList, updateItem, getCardPayload, itemParams: boardParams} = useItemLists({
    service: 'boards',
    params,
  });

  async function addCardToList({list, close, card, tab}) {
    try {
      const order = $lget(card, ['order']);
      const cardsOnList = $lget(list, ['_fastjoin', 'cards'], []);
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
        result = await cardStore.patch(
          card._id,
          {
            $addToSet: {
              boards,
            },
          },
          boardParams.value,
        );
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

  async function handleEditCard({card, close}) {
    try {
      const result = await new models.api.Cards(card).save();
      close();
      $q.notify({
        type: 'positive',
        message: `Successfully edited ${$lget(result, 'name')}`,
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

  function moveToList({froList, toList, card}) {

    const contextObject = {
      account: activeAccount.value._id,
      user: authUser.value._id,
      login: authUser.value._fastjoin.logins.active._id,
    };

    const cardPatchQuery = {
      '_id': $lget(card, ['_id']),
      'boards.id': $lget(board.value, ['_id']),
    };
    const cardPatchObject = {
      '$currentDate': {
        'boards.$.onListAt': true,
      },
      // 'boards.$.id':  board.value._id,
      '$set': {
        'boards.$.currentList': toList,
      },
      '$push': {
        'boards.$.listHistory': {
          'from.board': $lget(board.value, '_id'),
          'from.list': froList,
          'to': toList,
          'movedBy': contextObject,
          'movedAt': Date.now(),
        },
      },
    };

    if($lget(card,'order')){
      $lset(cardPatchObject,['$set','order'],$lget(card,'order'));
    }

    return  new models.api.Cards({...card}).save({
      query: {
        ...cardPatchQuery
      },
      data: cardPatchObject,
    });

  }

  async function handleDeleteCard({list, card, close}) {
    const deleteOptions = list._id === board.value._id ? [
      {label: 'Remove permanently from this Board', value: 'permanently', color: 'secondary'},
      {label: 'Remove permanently from all boards', value: 'all', color: 'secondary'},
    ] :
      [
        {label: 'Move to this Board\'s Recycle Bin list.', value: 'recycle', color: 'secondary'},
        {label: 'Remove permanently from this Board', value: 'permanently', color: 'secondary'},
        {label: 'Remove permanently from all boards', value: 'all', color: 'secondary'},
      ];
    $q.dialog({
      title: 'Options',
      message: 'Choose your delete option.)',
      options: {
        type: 'radio',
        model: list._id === board.value._id ? 'permanently' : 'recycle',
        // isValid: val => val === 'opt2',
        // inline: true
        items: deleteOptions,
      },
      cancel: true,
      persistent: true,
    }).onOk(async data => {
      // console.log('>>>> OK, received', data);
      try {
        const froList = list._id;
        const toList = board.value._id;

        let action;
        switch (data) {

          case 'recycle': {
            const result = await moveToList({froList, toList, card});
            console.log({result});
            action = `Successfully recycled ${$lget(card, 'name')}`;
            break;
          }
          case 'permanently': {

            const boardId = $lget(board.value, '_id');

            // when we remove, remove only from the boards in data but do not delete the card unless now boards are empty
            const result = await cardStore.patch(
              card._id,
              {$set: {'boards.$.removed': true}},
              {
                ...boardParams.value,
                query: {'boards.id': boardId},
              },
            );
            action = `${$lget(result, 'name')} will be removed permanently from this board after 30 days`;
            break;
          }
          default: {
            //
            const cardId = $lget(card, ['_id']);
            const result = await new models.api.Cards(card).remove(cardId);
            action = `${$lget(result, 'name')} will be removed permanently from all boards after 30 days`;
          }
        }
        close();
        $q.notify({
          type: 'positive',
          message: action,
        });
      } catch (e) {
        // $q.notify({
        //   type: 'negative',
        //   message: e.message,
        //   timeout: 30000,
        //   actions: [
        //     {
        //       icon: 'close', color: 'white', handler: () => {
        //         /* ... */
        //       },
        //     },
        //   ],
        // });
      }
    });
  }

  async function handleRestoreFromRecycle({card, close}) {
    const thisBoardOnCard = card.boards.find(brd => brd.id === board.value._id);
    const {listHistory} = thisBoardOnCard;
    const froList = board.value._id;
    const historyB4Recycle = listHistory.find(item => item.to === froList);
    const toList = $lget(historyB4Recycle, ['from', 'list']);
    try {
      console.log({froList, toList});
      const result = await moveToList({froList, toList, card});
      console.log({result});
      close();
      $q.notify({
        type: 'positive',
        message: `Successfully restored ${$lget(card, 'name')} card from Recycle Bin.`,
      });
    } catch (e) {
      // $q.notify({
      //   type: 'negative',
      //   message: e.message,
      //   timeout: 30000,
      //   actions: [
      //     {
      //       icon: 'close', color: 'white', handler: () => {
      //         /* ... */
      //       },
      //     },
      //   ],
      // });
    }
  }

  async function handleCardDrop(dropResult) {
    const {removedOrder, addedOrder, card, newList, oldList} = dropResult;
    if (newList._id === oldList._id) {
      console.log(card);
      console.log('same list');

      const otherCardsOnList = $lget(newList,['_fastjoin','cards']).filter(crd =>crd._id !==card._id);

      if(removedOrder > addedOrder) {
        console.log('Moved Up');
        const cardsWhosePosnIncreased = otherCardsOnList.filter(crd => (crd.order < removedOrder) && crd.order >= addedOrder);
        const theirIds = cardsWhosePosnIncreased.map(crd => crd._id);
        //their posn has increased by 1
        await Promise.all([
          cardStore.patch(card._id,{order: addedOrder}),
          cardStore.patch(
            null,
            {$inc : {'order' : 1}},
            {
              query: {
                _id: {$in: theirIds}
              }
            }
          )
        ]);
      } else {
        console.log('Moved Down');
        const cardsWhosePosnDecreased = otherCardsOnList.filter(crd => (crd.order > removedOrder) && crd.order <= addedOrder);
        const theirIds = cardsWhosePosnDecreased.map(crd => crd._id);
        //their posn has decreased by 1
        await Promise.all([

          cardStore.patch(card._id,{order: addedOrder}),
          cardStore.patch(
            null,
            {$inc : {'order' : -1}},
            {
              query: {
                _id: {$in: theirIds}
              }
            }
          )
        ]);
      }
    } else {
      console.log('Changed lists',{addedOrder});
      // TODO: Test some casl abilities based on rules on list  if failed, add dialog with fields to help provide info to satisfy ability
      // NB: rules will be checked backend too
      //else run this code
      const froList = oldList._id;
      const toList = newList._id;
      try {
        const result = await moveToList({froList, toList, card});
        console.log({result});
        close();
        $q.notify({
          type: 'positive',
          message: `Successfully restored ${this.$lget(card, 'name')} card to ${newList.name} list.`,
        });
      } catch (e) {
        // this.$q.notify({
        //   type: 'negative',
        //   message: e.message,
        //   timeout: 30000,
        //   actions: [
        //     {
        //       icon: 'close', color: 'white', handler: () => {
        //         /* ... */
        //       },
        //     },
        //   ],
        // });
      }
    }
  }


</script>

<style scoped>

</style>

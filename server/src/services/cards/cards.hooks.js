// const {iff, fastJoin} = require('feathers-hooks-common');
// // const sanitize = require('../../../hooks/ir-chat-sanitize');
// const Changed = require('../../utils/changed');
// const {detailedDiff} = require('deep-object-diff');

const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');

const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateBoardsConfig = {
  paramsName: 'relateBoardsConfig',
  herePath: 'boards',
  therePath: 'lists',
  thereService: 'boards',
  passParams: true,
  // noTransaction: true,
  beforeHooks: [
    async context => {
      const boards = lget(context, ['params', 'relateMtm', 'relateBoardsConfig', 'newFkIds'], []);
      const newFkIds = boards.map(item => item.id);
      let cardId = lget(context, ['params', 'relateMtm', 'relateBoardsConfig', 'patchObj','$addToSet','lists'], undefined);

      if (newFkIds.length > 0) {
        lset(context, ['params', 'relateMtm', 'relateBoardsConfig', 'newFkIds'], undefined); // to override relate hooks patch
      }

      if(boards.length) {
        const {id, currentList, listHistory} = boards.find(board => String(board.id) === String(newFkIds[0]));
        const previousHistory = listHistory.find(history => String(history.to) === String(currentList));
        const oldBoard = (lget(previousHistory,['from','board']));
        const oldList = (lget(previousHistory,['from','list']));

        let cardsOnPreviousList = [];

        if(oldBoard && oldList !== currentList) {

          const boardPullQuery = { _id: oldBoard, 'lists._id': oldList};
          const boardPullObj = {
            $pull: {'lists.$.cards': cardId}
          };
          try {
            const pullMtm_res = await  coreCall(context,'boards').patch(
              null,
              boardPullObj,
              {
                query: {
                  ...context.params.query,
                  ...boardPullQuery
                },
                relate_hook: 'relateMtm',
                disableSoftDelete: true,
                boardListResolversQuery: {
                  lists: true
                }
              },
            );
            const oldBoard = pullMtm_res.find(bd => String(bd._id) === String(id));
            const oldBoardLists = lget(oldBoard,['lists'],[]);
            // exclude recycle bin list
            oldBoardLists.filter(lst => String(lst._id) === id);
            const previousList = oldBoardLists.find(lst => String(lst._id) === String(oldList));
            cardsOnPreviousList = lget(previousList,['_fastjoin','cards'],[]);
          } catch (e) {
            console.log('Error for pulls');
            throw new Error(e);
          }
        }

        try{
          const patchQuery = {
            _id: id,
            'lists._id': currentList
          };

          const patchObj = {
            $addToSet: {'lists.$.cards':  cardId}
          };
          let relateMtm_res = await coreCall(context,'boards').patch(
            null,
            patchObj,
            {
              query: {
                ...context.params.query,
                ...patchQuery
              },
              relate_hook: 'relateMtm',
              disableSoftDelete: true,
              boardListResolversQuery: {
                lists: true
              }
            },
          );



          const currentBoard = relateMtm_res.find(item => String(item._id) ===String(id));
          let currentBoardLists = lget(currentBoard,['lists'],[]);
          // exclude recycle bin list
          currentBoardLists.filter(lst => String(lst._id) === id);
          const currentListOnCurrentBoard = currentBoardLists.find(lst => String(lst._id) === String(currentList));
          const cardsOnCurrentList = lget(currentListOnCurrentBoard,['_fastjoin','cards'],[]);
          const thisCard = cardsOnCurrentList.find(crd => String(crd._id) === String(cardId));
          const otherCardsOnCurrentList = cardsOnCurrentList.filter(crd => String(crd._id) !== String(cardId));


          if(otherCardsOnCurrentList.length) {
            // if this is not the only card on the current list, we need to check its order with respect to the orders of other cards
            const cardsWhoseOrderMustBeIncremented = otherCardsOnCurrentList.filter(crd => crd.order >= lget(thisCard,'order'));
            if(cardsWhoseOrderMustBeIncremented.length) {
              //
              const theirIds =  cardsWhoseOrderMustBeIncremented.map(crd => crd._id);
              await coreCall(context,context.path).patch(
                null,
                {$inc : {'order' : 1}},
                {
                  query: {
                    ...context.params.query,
                    _id: {
                      $in: theirIds
                    }
                  },
                  relate_hook: 'relateMtm',
                  disableSoftDelete: true,
                  boardListResolversQuery: {
                    lists: true
                  }
                },
              );
            }
          }

          const cardsWhoseOrderMustBeDecremented = cardsOnPreviousList.filter(crd => crd.order > lget(thisCard,'order'));

          if(cardsWhoseOrderMustBeDecremented.length){
            const theirIds =  cardsWhoseOrderMustBeDecremented.map(crd => crd._id);
            await coreCall(context,context.path).patch(
              null,
              {$inc : {'order' : -1}},
              {
                query: {
                  ...context.params.query,
                  _id: {
                    $in: theirIds
                  }
                },
                relate_hook: 'relateMtm',
                disableSoftDelete: true,
                boardListResolversQuery: {
                  lists: true
                }
              },
            );
          }

          lset(context, ['params', 'relateMtm', 'relateBoardsConfig', 'relateMtm_res'], relateMtm_res);
        } catch (e) {
          console.log('Error for card patches');
          throw new Error(e);
        }

      }

      let removedFkIds = lget(context, ['params', 'relateMtm', 'relateBoardsConfig', 'removedFkIds'], []).map(item => item.id);
      if (removedFkIds.length) {
        lset(context, ['params', 'relateMtm', 'relateBoardsConfig', 'removedFkIds'], undefined);
      }


      const boardsToRemoveDeletedCardsFrom = lget(context, ['params', 'removeMtm', 'relateBoardsConfig', 'fkIds'], []);
      const idPath = lget(context, ['params', 'removeMtm', 'relateBoardsConfig', 'relateParams','idPath'], '_id');
      const dataPath = lget(context, ['params', 'removeMtm', 'relateBoardsConfig', 'relateParams','dataPath'], 'result');
      const cardIdToRemove = lget(context,[dataPath,idPath]);
      if (boardsToRemoveDeletedCardsFrom.length) {
        lset(context, ['params', 'removeMtm', 'relateBoardsConfig', 'fkIds'], undefined);
        try {
          await Promise.all([boardsToRemoveDeletedCardsFrom.map(board=>{
            const boardPullQuery = { _id: lget(board,['id']), 'lists._id': lget(board,['currentList'])};
            const boardPullObj = {
              $pull: {'lists.$.cards': cardIdToRemove}
            };
            return coreCall(context,'boards').patch(
              null,
              boardPullObj,
              {
                query: {
                  ...context.params.query,
                  ...boardPullQuery
                },
                relate_hook: 'relateMtm',
                disableSoftDelete: true,
                boardListResolversQuery: {
                  lists: true
                }
              },
            );
          })]);
        } catch (e) {
          console.log('Error for boards pulls');
          throw new Error(e);
        }
      }
    },
  ],

};



//
// const cardResolvers = {
//   joins: {
//     list: ($select, customParams = {}) => async (card, context) => {
//       if (card.list) {
//         let params = {
//           query: {
//             $client: {
//               ...customParams
//             },
//           },
//         };
//         if ($select) {
//           lset(params, 'query.$select', $select);
//         }
//         const list = await coreCall(context, 'lists').get(card.list, {
//           ...params,
//         })
//           .catch(err => {
//             console.error('error joining list to card: ' + err.message);
//           });
//         lset(card, '_fastjoin.list', list);
//       }
//     },
//
//     parent: ($select, customParams = {}) => async (card, context) => {
//       if (card.parent) {
//         let params = {
//           query: {
//             $client: {
//               ...customParams
//             },
//           },
//         };
//         if ($select) {
//           lset(params, 'query.$select', $select);
//         }
//         const parent = await coreCall(context, 'cards').get(card.parent, {
//           ...params,
//         })
//           .catch(err => {
//             console.error('error joining parent to card: ' + err.message);
//           });
//         lset(card, '_fastjoin.parent', parent);
//       }
//     },
//   },
// };

// const commentsUserResolvers = {
//   joins: {
//     // eslint-disable-next-line no-unused-vars
//     setCommentsUser: $select => async (card, context) => {
//       let comments = lget(card, 'comments', []);
//       let user_ids = comments.map(comment => comment.createdBy);
//       if (user_ids.length > 0) {
//         let users_res = await coreCall(context, 'users').find({
//           query: {
//             _id: user_ids,
//           },
//         });
//         let users = users_res.data;
//
//         let fatjoin_comments = comments.map(comment => {
//           return lset(Object.assign({}, comment),
//             'createdBy',
//             users.find(user => String(user._id) === String(comment.createdBy)) || comment.createdBy);
//         });
//         lset(card, '_fastjoin.comments', fatjoin_comments);
//       }
//     },
//     // eslint-disable-next-line no-unused-vars
//     setOwners: $select => async (card, context) => {
//       let user_ids = lget(card, 'owners', []);
//       if (user_ids.length > 0) {
//         let users_res = await coreCall(context, 'accounts').find({
//           query: {
//             _id: user_ids,
//           },
//         });
//         let users = users_res.data;
//
//         lset(card, '_fastjoin.owners', users);
//       }
//     },
//   },
// };

// const cardEventsResolvers = {
//   joins: {
//     // eslint-disable-next-line no-unused-vars
//     setCardEvents: $select => async (card, context) => {
//       let event_ids = lget(card, 'cardEvents', []);
//       if (event_ids.length) {
//         let events_res = await coreCall(context, 'card-events').find({
//           query: {
//             _id: event_ids,
//           },
//         });
//         let cardEvents = events_res.data;
//
//         lset(card, '_fastjoin.cardEvents', cardEvents);
//       }
//     },
//   },
// };

// const checkCardCompleted = async (context) => {
//   if (context.data.card) {
//     let card_id = context.data.card;
//     let card = await coreCall(context, 'cards').get(card_id);
//     if (lget(card, 'completeCard')) {
//       context.data.completed = true;
//       context.data.completedAt = new Date();
//     } else {
//       context.data.completed = false;
//       context.data.completedAt = null;
//     }
//   }
//   return context;
// };

// const channelUpdateCheck = async (context) => {
//   checkContext(context, 'after');
//   if (context.result.list) {
//     const list = await coreCall(context, 'lists').get(context.result.list, {$fastJoinCards: true, disableSoftDelete: true});
//     if (!list.deleted) context.app.service('lists').emit('updated', list);
//   }
// };

// const auditLogBefore = async (context) => {
//   checkContext(context, 'before', ['create', 'update', 'patch'], 'auditLogBefore');
//   let beforeResult = context.id ? await coreCall(context, 'cards').get(context.id) : {};
//   if (context.method === 'create') {
//     beforeResult = {};
//   }
//   context.params['beforeResult'] = beforeResult;
// };

// const auditLogAfter = ({eventName, addBeforeAfter = false} = {}) => {
//   return async (context) => {
//     checkContext(context, 'after', ['create', 'update', 'patch'], 'auditLogAfter');
//     let event;
//
//     let beforeResult = context.params['beforeResult'];
//
//     let diff = detailedDiff(beforeResult, context.result);
//     let changed = Changed(beforeResult, context.result);
//
//
//     if (typeof eventName === 'function') {
//       event = eventName(context, {before: beforeResult, after: context.result, diff, changed});
//       if (typeof event !== 'string') {
//         // maybe throw error.
//         event = '';
//       }
//     } else {
//       event = eventName;
//     }
//
//     if (!event || event === '') {
//       event = `service: ${context.path}, method: ${context.method}`;
//     }
//
//     let data = {
//       modelId: context.id || context.result._id,
//       modelName: context.path,
//       event,
//       diff,
//       changed,
//     };
//
//     if (context.params.user) {
//       data.createdBy = context.params.user._id;
//     }
//
//     if (addBeforeAfter) {
//       data.before = beforeResult;
//       data.after = context.result;
//     }
//
//     coreCall(context, 'pm-transaction-logs').create(data);
//
//     return context;
//   };
// };

// const userResolvers = {
//   joins: {
//     // eslint-disable-next-line no-unused-vars
//     setUser: $select => async (card, context) => {
//       let user_create_id = lget(card, 'createdBy');
//       if (user_create_id) {
//         let user = await coreCall(context, 'users').get(user_create_id);
//         lset(card, '_fastjoin.createdBy', user);
//       }
//       let user_update_id = lget(card, 'updatedBy');
//       if (user_update_id) {
//         let user = await coreCall(context, 'users').get(user_update_id);
//         lset(card, '_fastjoin.updatedBy', user);
//       }
//     },
//   },
// };

// const relateCard = async context => {
//   const config = {
//     herePath: 'list',
//     therePath: 'cards',
//     thereService: 'lists',
//     addParams: {
//       disableSoftDelete: true
//     },
//   };
//   await relate('otm', config)(context);
// };

// const removeChildren = async (context) => {
//   const resultId = context.result._id;
//   if (context.result.children.length > 0) {
//     await Promise.all(context.result.children.map(child => {
//       coreCall(context, 'cards').remove(child);
//     }));
//   }
//   if (lget(context, 'result.parent')) {
//     await coreCall(context, 'cards').find({query: {_id: context.result.parent}}).then((res) => {
//       if (res.data.length > 0) {
//         let children = res.data[0].children;
//         let filtered = children.filter((child) => {
//           if (!resultId.equals(child._id)) {
//             return child;
//           }
//         });
//         coreCall(context, 'cards').patch(context.result.parent, {children: filtered});
//       }
//     });
//
//   }
//   return context;
// };

// const updateUnseenTasks = async (context) => {
//   checkContext(context, ['before', 'after'], ['create', 'patch', 'update']);
//
//   if (context.type === 'before' && context.method !== 'create') {
//     let card = await coreCall(context, 'cards').get(context.id);
//     lset(context, 'params.ownersBefore', lget(card, 'owners', []));
//   } else {
//     let ownersBefore = lget(context, 'params.ownersBefore', []).map(o => JSON.stringify(o));
//     let ownersAfter = lget(context, 'result.owners', []).map(o => JSON.stringify(o));
//
//     // returns items in ownersAfter that aren't in ownersBefore
//     const newOwners = ownersAfter.filter(item => !ownersBefore.includes(item)).map(o => JSON.parse(o));
//
//     newOwners.forEach(ownerId => {
//       coreCall(context, 'accounts').patch(ownerId, {
//         $addToSet: {
//           unseenTasks: context.result._id,
//         }
//       }).catch(err => {
//         console.log('cards.hooks.js -> updateUnseenTasks: ', err);
//       });
//     });
//   }
//
//   return context;
// };


module.exports = {
  before: {
    all: [

    ],
    find: [],
    get: [],
    create: [
      setEnvironment,
      context => {
        return context;
      },
      relate('mtm',relateBoardsConfig),
      // relateCard,
      // auditLogBefore,
      // checkCardCompleted,
      // updateUnseenTasks,
    ],
    update: [
      setEnvironment,
      relate('mtm',relateBoardsConfig),
      // relateCard,
      // auditLogBefore,
      // checkCardCompleted,
      // updateUnseenTasks,
    ],
    patch: [
      setEnvironment,
      relate('mtm',relateBoardsConfig),
      context => {
        return context;
      },
      // sanitize({paths: ['data.$push.comments[0].comment']}),
      // relateCard,
      // auditLogBefore,
      // checkCardCompleted,
      // updateUnseenTasks,
    ],
    remove: [
      // context =>{
      // // when we remove, remove only from the boards in data but do not delete the card unless now boards are empty
      //   context.params.disableSoftDelete = true;
      //   return context;
      // },
      relate('mtm',relateBoardsConfig),
      // relateCard,
      // removeChildren,
    ],
  },

  after: {
    all: [

      // populate({ populates, namedQueries }),
      // iff(
      //   context => {
      //     return lget(context, 'params.$fastJoinCardUser', false);
      //   },
      //   [
      //     // fastJoin(userResolvers),
      //   ],
      // ),
      // iff(
      //   context => {
      //     return lget(context, 'params.$fastJoinCardCommentsUser', false);
      //   },
      //   // fastJoin(commentsUserResolvers),
      // ),
      // fastJoin(cardEventsResolvers),
      // fastJoin(
      //   cardResolvers,
      //   context => {
      //     let query = {};
      //     if (lget(context, ['params', 'cardResolversQuery'])) {
      //       Object.keys(cardResolvers.joins).forEach(key => {
      //         let val = lget(context, ['params', 'cardResolversQuery', key], false);
      //         if (val) lset(query, key, val);
      //       });
      //     }
      //     return query;
      //   },
      // ),
    ],
    find: [],
    get: [],
    create: [
      relate('mtm',relateBoardsConfig),

      // auditLogAfter({
      //   eventName: (context, {before, after}) => {
      //     if (String(before.card) !== String(after.card)) {
      //       return 'cardChange';
      //     } else if (before.name !== after.name) {
      //       return 'nameChange';
      //     } else {
      //       return undefined;
      //     }
      //   },
      //   addBeforeAfter: true,
      // }),
      // relateCard,
      // channelUpdateCheck,
      // updateUnseenTasks,
    ],
    update: [
      relate('mtm',relateBoardsConfig),
      // auditLogAfter({
      //   eventName: (context, {before, after}) => {
      //     if (String(before.card) !== String(after.card)) {
      //       return 'cardChange';
      //     } else if (before.name !== after.name) {
      //       return 'nameChange';
      //     } else {
      //       return undefined;
      //     }
      //   },
      //   addBeforeAfter: true,
      // }),
      // relateCard,
      // channelUpdateCheck,
      // updateUnseenTasks,
    ],
    patch: [
      relate('mtm',relateBoardsConfig),
      // auditLogAfter({
      //   eventName: (context, {before, after}) => {
      //     if (String(before.card) !== String(after.card)) {
      //       return 'cardChange';
      //     } else if (before.name !== after.name) {
      //       return 'nameChange';
      //     } else {
      //       return undefined;
      //     }
      //   },
      //   addBeforeAfter: true,
      // }),
      // relateCard,
      // channelUpdateCheck,
      // updateUnseenTasks,
    ],
    remove: [
      relate('mtm',relateBoardsConfig),
      // relateCard,
      // channelUpdateCheck,
    ],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};

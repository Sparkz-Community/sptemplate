const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {
  utils: {coreCall}
} = require('@iy4u/common-server-lib');

const taskListOwnerResolvers = {
  joins: {
    lists: ($select, customParams = {}) => async (board, context) => {
      board.lists = await Promise.all(
        lget(board,'lists',[]).map(async list => {
          list.cards = await Promise.all(
            lget(list,'cards',[]).map(async card => {
              card.comments = await Promise.all(
                lget(card,'comments',[]).map( async comment => {
                  const createdById = lget(comment, ['createdBy', 'account']);
                  const updatedById = lget(comment, ['updatedBy', 'account']);
                  let params = {
                    query: {
                      $client: {
                        ...customParams,
                      },
                    },
                  };
                  const  [createdBy, updatedBy] = await Promise.all([
                    coreCall(context, 'accounts').get(createdById, {
                      ...params,
                      paginate: false,
                    }),
                    coreCall(context, 'accounts').get(updatedById, {
                      ...params,
                      paginate: false,
                    })
                  ]);
                  lset(comment,['_fastjoin','createdBy'], createdBy);
                  lset(comment,['_fastjoin','updatedBy'], updatedBy);
                  return comment;
                })
              );
              return card;
            })
          );
          return list;
        })
      );

    },
  },
};

module.exports = taskListOwnerResolvers;

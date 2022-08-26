import {lodash} from '@sparkz-community/common-client-lib';

const {$lget}  = lodash;


export function getMaxOrder (objectArray) {
  if ($lget(objectArray,'length')) {
    const boardOrders = objectArray.map(item => item?.order);
    return Math.max(...boardOrders) + 1;
  } else {
    return 1;
  }
}

export function moveItem (removedOrder, addedOrder, payload, allItems) {
  let affectItems = allItems.filter(itm => itm._id !==payload._id);

  payload.order = addedOrder;

  if (removedOrder > addedOrder) {
    // moved left
    affectItems = affectItems
      .filter(itm => itm.order < removedOrder &&  itm.order >= addedOrder)
      .map(itm => {
        itm.order +=1;
        return itm;
      });
    console.log('mama', addedOrder);
  }
  if (removedOrder < addedOrder) {
    // moved right
    affectItems = affectItems
      .filter(itm => itm.order > removedOrder &&  itm.order <= addedOrder)
      .map(itm => {
        itm.order -=1;
        return itm;
      });
  }

  return [payload, ...affectItems];
}


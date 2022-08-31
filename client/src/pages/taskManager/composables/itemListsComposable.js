import {computed, onMounted, ref} from 'vue';
import{models} from 'feathers-pinia';
import {useRoute} from 'vue-router';
import {lodash, singularize} from '@sparkz-community/common-client-lib';
import {useQuasar} from 'quasar';



const {$lcamelCase, $lcapitalize}  = lodash;

function nameModal (service) {
  let modalNameArray = service.split('-');
  modalNameArray = modalNameArray.map(item => $lcapitalize(item));
  return modalNameArray.join('');
}


export function useItemLists({
                               service,
                               query = {},
                               params = {},
                             } = {}) {

  const $q = useQuasar();
  const item = singularize(service);
  window[$lcamelCase(item)] = ref({});
  const modalName = nameModal(service);
  const Model = models.api[modalName];

  const $route = useRoute();
  const {id} = $route.params;

  onMounted(async () => {
    window[$lcamelCase(`get-${service}`)]();

    Model.on('created',window[$lcamelCase(`get-${service}`)]);
    Model.on('patched',window[$lcamelCase(`get-${service}`)]);
    Model.on('removed',window[$lcamelCase(`get-${service}`)]);
  });

  window[$lcamelCase(`${item}-params`)] = computed(() => {
    return {
      $fastJoinShared: true, // common
      [`${service}_fJoinHookResolversQuery`]: { // common
        owner: true,
      },
      ...params.value
    };
  });

   window[$lcamelCase(`get-${service}`)] = async function() {
    window[$lcamelCase(item)]['value'] = await Model.get(id,{
      ...params.value,
      query: {
        ...query.value
      }
    });
  };

  return {
    item:window[$lcamelCase(item)],
    itemParams:window[$lcamelCase(`${item}-params`)],
    getCardPayload: function (list) {
      return index => {
        return list.cards.find((_, idx) => idx === (index));
      };
    },
    addList: async function (list, customParams = {}) {
      try {
        window[$lcamelCase(item)].value = await new Model({...window[$lcamelCase(item)].value}).save({
          data: {
            $addToSet: {
              lists: list,
            },
          },
          ...params.value,
          query: {
            ...query.value
          },
            ...customParams
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
    },
    updateItem: async function (data, customParams = {}) {
      try {
        window[$lcamelCase(item)].value = await new Model({...window[$lcamelCase(item)].value}).save({
          data,
          ...params.value,
          query: {
            ...query.value,
          },
          ...customParams
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
  };
}

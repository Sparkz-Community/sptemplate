import {onMounted, ref} from 'vue';
import{models} from 'feathers-pinia';
import {useRoute} from 'vue-router';
import {lodash, singularize} from '@sparkz-community/common-client-lib';

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

  const item = singularize(service);
  window[$lcamelCase(item)] = ref({});
  const modalName = nameModal(service);
  const Model = models.api[modalName];

  const $route = useRoute();
  const {id} = $route.params;

  onMounted(async () => {

    window[$lcamelCase(item)]['value'] = await Model.get(id,{
      ...params,
      query: {
        ...params.query,
        ...query
      }
    });
  });



  return {
    item:window[$lcamelCase(item)],
    changeName: async function () {
      try {
        window[$lcamelCase(item)].value = await new Model({...window[$lcamelCase(item)].value}).save();
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
    }
  };
}

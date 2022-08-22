<template>
  <q-input v-bind="$attrs" :model-value="'model-value'" @update:model-value="$emit('update:model-value', $event)">
    <template v-slot:prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy transition-show="scale" transition-hide="scale">
          <q-date :model-value="'model-value'"
                  @update:model-value="$emit('update:model-value', $event)"
                  mask="YYYY-MM-DD HH:mm">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat/>
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>

    <template v-slot:append>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy transition-show="scale" transition-hide="scale">
          <q-time :model-value="'model-value'"
                  @update:model-value="$emit('update:model-value', $event)"
                  mask="YYYY-MM-DD HH:mm" format24h>
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat/>
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
  export default {
    name: 'date-piker',
    props: {
      'model-value': {
        type: String,
        required: true,
      }
    },
  };
</script>

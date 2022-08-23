<template>
  <report-item class="ReportItemList" :data="data">
    <template #child="item">
      <template v-if="item.hasOwnProperty('Rows')">
        <report-item-list :data="item"/>
      </template>
<!--      <report-item v-else :data="item"/>-->
    </template>
  </report-item>
</template>

<script>
  import ReportItem from '../ReportItem/ReportItem';
  export default {
    name: 'ReportItemList',
    components: {ReportItem},
    props: {
      data: {
        type: Object,
        required: true
      }
    },
  };
</script>

<style lang="scss" scoped src="./_ReportItemList.scss">

</style>


import { defineStore } from 'pinia';




const servicePath = 'colors';
const useColorStore = defineStore(servicePath, {

  state() {
    return {
      softAutomn: ['#2e180e', '#a77c52', '#f2dbc1', '#faf5ef', '#3e4625', '#ffd1d1', '#d3bd89', '#b3975a', '#9e7b36', '#cb8f74', '#ab6c50', '#b76874', '#dfa5a5', '#915054', '#682c2e', '#604a66', '#704a78', '#876a8d', '#345456', '#3e7670', '#6e9591', '#b1b999', '#7b8452', '#525640'],
      lightSpring: ['#eedcd8', '#e5d2d3', '#e6cfbd', '#d8c6ae', '#cbae8f', '#c9ae8e', '#e0bdb8', '#e7a49e', '#c6c2a6', '#958e7a', '#484448', '#efa4ba', '#ea588d', '#e72e77', '#e34976', '#d90d3a', '#01613f', '#309d32', '#66b258', '#88c979', '#aed384', '#3e1920', '#3d3238', '#5f545e', '#ada09e', '#cdc3c3', '#afaab4', '#61606a', '#373a4b', '#59412a', '#5b2b27', '#78cfdc', '#30b5c7', '#6bc7b8', '#149e9c', '#045b54', '#02607a', '#1599c0', '#64b2de', '#5b9ce4', '#83bbe7', '#d59e3b', '#e5be74', '#dab744', '#e7c667', '#e3d85b', '#000852', '#033681', '#0726a5', '#4260ba', '#789bd8', '#c51419', '#da3e42', '#e37267', '#e37250', '#e0a28c', '#df92a6', '#e07062', '#e06f4b', '#e09e8a', '#e093a7', '#de8895', '#d85b71', '#d5375a', '#d1194a', '#9490dc', '#665cc4', '#160f5c'],
    };
  },
  getters: {},
  actions: {},
});


export default useColorStore;

import {boot} from 'quasar/wrappers';

export default boot(({app}) => {
  app.mixin({
    data() {
      return {
        defaultImage: 'https://ha6755ad-images.s3-us-west-1.amazonaws.com/defaultImage.svg'
      };
    },
    methods: {
      $arrMove(arr, fromIndex, toIndex, obj) {
        let cloneArr = JSON.parse(JSON.stringify(arr));
        cloneArr.splice(fromIndex, 1);
        cloneArr.splice(toIndex, 0, obj);
        return cloneArr;
      },
      $getDefaultEmail(person, def){
        let email = this.$lget(person, 'email', []);
        if(email.length > 0) {
          let def = this.$lget(person, 'settings.defaults.email', null);
          let match = email.filter(e => e === def);
          return match?.length > 0 ? match[0] : null;
        } else return def ? def : null;
      },
      $getDefaultPhone(person, path){
        if(person.phones?.length > 0) {
          let def = this.$lget(person, 'settings.defaults.phone', null);
          let match = person.phones.filter(p => this.$lget(p, 'number.e164', 1) === this.$lget(def, 'number.e164', 2));
          if(match?.length > 0){
            return path ? this.$lget(match[0], path, null) : match[0];
          } else return null;
        } else return null;
      },
      $getDefaultAddress(person){
        if(person.phones?.length > 0) {
          let def = this.$lget(person, 'settings.defaults.address', null);
          let match = person.phones.filter(a => this.$lget(a, '_id', 'idDefault') === this.$lget(def, '_id', 2));
          return match?.length > 0 ? match[0] : null;
        } else return null;
      },
      $shareScore(obj) {
        let echos = obj?.echos?.length ? obj.echos.length : 0;
        let hushes = obj?.hushes?.length ? obj.hushes.length : 0;
        return echos - hushes;
      },
      $infoNotify(message){
        this.$q.notify({ message: message, color: 'info', position: 'top', icon: 'mdi-help-circle', timeout: 30000, closeBtn: true });
      },
      $errNotify(message){
        this.$q.notify({ message: message, color: 'negative', position: 'top', icon: 'mdi-alert-circle', timeout: 30000, closeBtn: true });
      },
      $quickNotify(message) {
        this.$q.notify({
          message: message,
          color: 'primary',
          position: 'top',
          timeout: 5000,
          actions: [{ icon: 'mdi-close', color: 'white' }],
        });
      },
      makeAvatar(string){
        return {
          small: { Location: string },
          medium: { Location: string },
          large: { Location: string },
          favicon: { Location: string }
        };
      },
      // eslint-disable-next-line no-unused-vars
      $isAdder(org, id){

      },
      $arrayFilterZero(filteredArray, def, prop, i){
        let idx = i ? i : 0;
        if(filteredArray?.length){
          return !prop ? filteredArray[idx] : filteredArray[idx][prop];
        } else return def || def === 0 ? def : null;
      },
      lGetFromTemplate(obj, path, def){
        return this.$lget(obj, path, def);
      },
      lFlattenTemplate(arr){
        return this.lflatten(arr);
      },
      getAvatar(obj, path, size, idx, defaultImg) {
        // let sz = size ? size : 'small';
        let def = defaultImg ? defaultImg : null;
        let sz = 'large';
        // console.log('getting avatar', obj, path, size)
        if (this.$lget(obj, [path]) && !idx && idx !== 0) {
          if (this.$lget(obj, [path, sz, 'file'], '').length) {
            return this.$lget(obj, [path, sz, 'file']);
          } else return null;
        } else if(obj && !path){
          if(idx || idx === 0){
            // console.log('obj no path and idx');
            return this.$lget(obj, [idx, sz, 'file']);
          } else return this.$lget(obj, [sz, 'file']);
        } else if(obj && (idx || idx === 0)){
          if(this.$lget(obj, [path, idx, sz, 'file'], '').length) {
            return this.$lget(obj, [path, idx, sz, 'file']);
          }   else return def;
          // else if(obj && !path) {
          //   console.log('obj no path');
          //   if(idx || idx === 0){
          //     console.log('obj no path and idx');
          //     return this.$lget(obj, [idx, sz, 'file']);
          //   } else return this.$lget(obj, [sz, 'file']);
          // }
        } else return def;
      }
      // lget effort
      // getAvatar(obj, path, size, idx) {
      //   // let sz = size ? size : 'small';
      //   let sz = 'large';
      //   // console.log('getting avatar', obj, path, size)
      //   if (obj && obj[path] && !idx && idx !== 0) {
      //       return this.$lget(obj, [path, sz, 'file'], null)
      //   } else if(obj && !path){
      //     return this.$lget(obj, [sz, 'file'], null)
      //   } else if(obj && (idx || idx === 0)){
      //     if(lget(obj, [path[idx], sz, 'file'], null)) return this.$lget(obj, [path[idx], sz, 'file'], null);
      //     else if(obj && !path) return this.$lget(obj, [sz, 'file'], null);
      //     else return null;
      //   }
      //   else return null;
      // }
    }
  });
});


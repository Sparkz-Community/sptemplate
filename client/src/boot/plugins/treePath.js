import {boot} from 'quasar/wrappers';

export default boot(({app}) => {
  app.mixin({
    methods: {
      setParent() {
        this.currentElement = this.$lget(this.treePath, '[0]', {});
      },
    },
  });
});

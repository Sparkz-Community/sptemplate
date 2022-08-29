class Timer {
  /**
   * A timer for executing a function after a given interval.
   * @param iv {Number} Wait time in ms to execute callback.
   * @param cb {Function} A callback to execute
   * @param args {any} Arguments passed will be given to the callback on execution.
   * @return {Promise} Promise which resolves with running the callback.
   */
  constructor({cb = null, iv = 4000} = {}, ...args) {
    this.running = false;
    this.resolve = null;
    this._init_(cb, iv, ...args);
  }

  _init_(cb, iv, ...args) {
    let self = this;
    this.iv = iv;
    this.args = args;
    if(cb) this.cb = cb;
    clearInterval(this.timeout);
    this.timeout = this.cb ? setTimeout(() => {
      self.execute();
    }, this.iv) : null;
  }

  start({cb, iv} = {}, ...args) {
    let self = this;
    self.running = true;
    return new Promise((rv) => {
      self.resolve = rv;
      self._init_(cb, iv, ...args);
    });
  }
  execute(){
    if(!this.running || !this.resolve) return false;
    this.resolve(this.cb(...this.args));
    this.stop();
  }
  stop(){
    clearInterval(this.timeout);
    this.resolve = null;
    this.running = false;
  }
  setInterval(iv){
    this.iv = iv;
    if (this.running) {
      return this.start({iv});
    }
  }
  setCallBack(cb){
    this.cb = cb;
    if (this.running) {
      return this.start();
    }
  }
}
// const Timer = {
//   install(Vue) {
//     Vue.mixin({
//       methods: {
//         $timer: Timer
//       }
//     });
//   }
//
// };

// export { Timer };
export default Timer;

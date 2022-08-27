import { defineStore } from 'pinia';
import {Notify} from 'quasar';

import axios from 'axios';
import ZangoDb from '@iy4u/zangodb';

import {lodash} from '@sparkz-community/common-client-lib';
const {$lget, $lset, $lcloneDeep, $lunset} = lodash;

import {Timer} from '../utils/timer';

import useAuthStore from './store.auth';
import useWpbPagesStore from './services/wpb-pages';
import useWpbProjectsStore from './services/wpb-projects';


Date.prototype.toDateTimeNum = function () {
  const yyyy = this.getFullYear().toString();
  const MM = pad(this.getMonth() + 1, 2);
  const dd = pad(this.getDate(), 2);
  const hh = pad(this.getHours(), 2);
  const mm = pad(this.getMinutes(), 2);
  const ss = pad(this.getSeconds(), 2);
  const ms = pad(this.getMilliseconds(), 2);
  return Number(yyyy + MM + dd + hh + mm + ss + ms);
};

function pad(number, length) {
  let str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

const saveQueueTimer = new Timer({});
const saveTimer = new Timer({});
let saveQueue = [];

export const useWpbStore = defineStore('wpb', {
  state: () => ({
    currentElement: {},
    currentDomElement: {},
    availableClasses: [],
    changesQue: {
      stylesQue: [],
    },
    currentDbCollection: null,
    currentDb: null,
    saved: true,
    autoSave: true,
    autoSaveDebounce: 15000,
    activeValue: '',
    undoRedoStatus: {undo: true, redo: true},
  }),
  getters: {
    getCurrentElement(state) {
      return state.currentElement;
    },
    getChangesQue(state) {
      return state.changesQue;
    },
    getCurrentDomElement(state) {
      return state.currentDomElement;
    },
    getAvailableClasses(state) {
      return state.availableClasses;
    },
    getCurrentDbCollection(state) {
      return state.currentDbCollection;
    },
    getCurrentDb(state) {
      return state.currentDb;
    },
  },
  actions: {
    setAutosavePreferences() {
      const authStore = useAuthStore();
      let autoSave = $lget(authStore.authUser, 'preferences.autoSave', {});
      this.autoSave = autoSave.value;
      this.autoSaveDebounce = autoSave.debounce;
    },
    setCurrentElement(payload) {
      this.currentElement = payload;
    },
    setCurrentDomElement(payload) {
      this.currentDomElement = payload;
    },
    setAvailableClasses(payload) {
      this.availableClasses = payload;
    },
    resetStylesQue(payload) {
      this.changesQue.stylesQue = payload;
    },
    generateProjectDb({project, user, pages}) {
      let projectId = $lget(project, '_id', project);
      if (!projectId) {
        throw Error(`dispatch: generateProjectDb -- project: ${project}`);
      }
      let userId = $lget(user, '_id', user);
      if (!userId) {
        throw Error(`dispatch: generateProjectDb -- user: ${user}`);
      }
      if (!pages || (Array.isArray(pages) && !pages.length)) pages = $lget(project, 'pages', []);
      if (pages && !Array.isArray(pages)) pages = [pages];
      const gen = async (proj, newDbName) => {
        return new Promise((resolve, reject) => {
          let collectionsConfig = {};


          pages.forEach(page => {
            collectionsConfig[page] = true;
          });

          let db = new ZangoDb.Db(newDbName, collectionsConfig);
          let collections = pages.reduce((acc, curr) => {
            acc[curr] = db.collection(curr);
            return acc;
          }, {});

          this[newDbName] = {
            db: db,
            collections: collections,
          };

          db.open((error) => {
            if (error) reject(error);
            resolve(db);
          });
        });
      };
      let name = projectId + userId;
      // console.log('state', name, state);
      let existingDb = $lget(this, `${name}.db`);
      if (existingDb) {
        if (pages.length) {
          const existingCollections = Object.keys($lget(this, `${name}.collections`));
          pages = pages.filter(page => {
            return !existingCollections.includes(page);
          });
          return gen(projectId, name)
            .then(res => {
              res.close();
              return res;
            });
        }
      } else {
        return gen(projectId, name)
          .then(res => {
            res.close();
            return res;
          });
      }
    },
    async setCurrentDbCollection({project, user, page, stop}) {
      let projectId = $lget(project, '_id', project);
      if (!projectId) {
        throw Error(`dispatch: setCurrentDbCollection -- project: ${project}`);
      }
      let userId = $lget(user, '_id', user);
      if (!userId) {
        throw Error(`dispatch: setCurrentDbCollection -- user: ${user}`);
      }
      let pageId = $lget(page, '_id', page);
      if (!pageId) {
        throw Error(`dispatch: setCurrentDbCollection -- page: ${page}`);
      }
      const db = projectId + userId;
      const collection = pageId;
      const existingDb = this[db];
      const existingCollection = $lget(this, `[${db}].collections[${collection}]`);
      if (existingCollection) {
        this.currentDbCollection = existingCollection;
        return existingCollection;
      } else {

        const payload = {
          project,
          user,
          pages: pageId,
        };
        if (!stop) {
          if (!existingDb) {
            await this.generateProjectDb(payload);
          } else {
            await this.addDbCollection(payload);
          }
          return this.setCurrentDbCollection({project: projectId, user, page, stop: true});
        } else {
          throw Error(`dispatch: setCurrentDbCollection -- stop: ${stop}`);
        }
      }
    },
    // async setCurrentDb({commit, state, dispatch}, {project, user, stop}) {
    //   let projectId = lget(project, '_id', project) || throw Error(`dispatch: setCurrentDb -- project: ${project}`);
    //   let userId = lget(user, '_id', user) || throw Error(`dispatch: setCurrentDb -- user: ${user}`);
    //   const dbName = projectId + userId;
    //   let existingDb = lget(state, `${dbName}.db`);
    //   if (existingDb) {
    //     return new Promise((resolve, reject) => {
    //       const cb = (error, db) => {
    //         if (error) reject(error);
    //         const payload = {
    //           newDb: {
    //             db,
    //             collections: state[dbName].collections,
    //           },
    //           name: dbName,
    //         };
    //         resolve(payload);
    //       };
    //       if (!existingDb._open) {
    //         existingDb.open(cb);
    //       } else {
    //         resolve({
    //           name: dbName,
    //           newDb: {
    //             db: existingDb,
    //             collections: lget(state, `${dbName}.collections`),
    //           },
    //         });
    //       }
    //     })
    //       .then(res => {
    //         return commit('SET_CURRENT_DB', res);
    //       });
    //
    //   } else {
    //     if (!stop) {
    //       await dispatch('generateProjectDb', {project, user});
    //       return dispatch('setCurrentDb', {project, user, stop: true});
    //     } else {
    //       throw Error(`dispatch: setCurrentDb -- stop: ${stop}`);
    //     }
    //   }
    // },
    async addDbCollection({project, user, pages, stop}) {
      let projectId = $lget(project, '_id', project);
      if (!projectId) {
        throw Error(`dispatch: addDbCollection -- project: ${project}`);
      }
      let userId = $lget(user, '_id', user);
      if (!userId) {
        throw Error(`dispatch: addDbCollection -- user: ${user}`);
      }
      const dbName = projectId + userId;
      let existingDb = $lget(this, `${dbName}.db`);
      if (existingDb) {
        // if (!pages || (Array.isArray(pages) && !pages.length)) pages = lget(project, 'pages', []);
        //   if (pages && !Array.isArray(pages)) pages = [pages];

        let cloneDB = $lcloneDeep(existingDb);
        try {
          let {added, collections} = await cloneDB.addIndexedCollection({[pages]: {autoIncrement: true}});

          console.log('addDbCollection', added);
          let payload = {
            db: cloneDB,
            collections,
          };
          this[dbName] = payload;
          return added;
        } catch (e) {
          console.log('addDbCollection error:', e);
        }
      } else {
        if (!stop) {
          await this.generateProjectDb({project, user, pages});
        } else {
          throw Error(`dispatch: addDbCollection -- stop: ${stop}`);
        }
      }
    },
    async undoRedo({type, page}) {
      let collection = $lcloneDeep(this.getCurrentDbCollection);
      if (!collection) {
        let authStore = useAuthStore();
        let user = authStore.authUser;
        await this.setCurrentDbCollection({project: page.project, user, page});
      } else {
        if (collection.name !== page._id) throw Error(`dispatch: ${type} -- collection.name !== page._id: ${collection.name} !== ${page._id}`);
        this.saved = false;
        let currentActive = await collection.findOne({active: true}, (error) => {
          if (error) {
            throw error;
          }
        });

        if (currentActive) {
          const undo = type === 'undo';


          let findExp = {_id: undo ? {$lt: currentActive._id} : {$gt: currentActive._id}};
          let makeActivesList = await collection.find(findExp).toArray((error, items) => {
            if (error) {
              throw error;
            }
            return items;
          });
          let makeActive = makeActivesList[undo ? makeActivesList.length - 1 : 0];

          let pageCopy = $lcloneDeep(page);

          let changes = currentActive.changes.filter(item => item.id === currentActive.meta.currentStateId);
          let last_change = changes[changes.length - 1];
          let currentValue = $lget(pageCopy, $lget(last_change, 'meta.pathToMe') + last_change.path);
          let activeState;
          let change_record;
          if (undo) {
            if (currentValue === last_change.before || (!currentValue && last_change.before === '$unset')) {
              activeState = 'before';
              change_record = makeActive ? makeActive : currentActive;
            } else {
              activeState = 'before';
              change_record = currentActive;
            }
          } else {
            if (currentValue === last_change.after || (!currentValue && last_change.after === '$unset')) {
              activeState = 'after';
              change_record = makeActive ? makeActive : currentActive;
            } else {
              activeState = 'after';
              change_record = currentActive;
            }
          }

          change_record.changes.forEach(change => {
            let changeValue = $lget(change, [activeState]);
            if (changeValue === '$unset') {
              $lunset(pageCopy, $lget(change, 'meta.pathToMe') + change.path);
            } else {
              $lset(pageCopy, $lget(change, 'meta.pathToMe') + change.path, changeValue);
            }
          });
          if (!change_record.active) {
            await new Promise((resolve, reject) => {
              collection.update({_id: currentActive._id}, {active: false}, error => error ? reject(error) : resolve());
            });
            await new Promise((resolve, reject) => {
              collection.update({_id: change_record._id}, {active: true}, error => error ? reject(error) : resolve());
            });
            // this.setUndoRedoStatus(pageCopy);
          }
          let wpbPagesStore = useWpbPagesStore();
          wpbPagesStore.addOrUpdate(pageCopy);

          let newCurrentElement = $lget(pageCopy, $lget(change_record, 'meta.pathToMe'));
          this.setCurrentElement({
            ...newCurrentElement,
            ...change_record.meta,
          });


          this.executeSave({pageId: pageCopy._id});
        } else {
          return new Error(`dispatch: ${type} -- currentActive: ${currentActive}`);
        }
      }
    },
    addToSaveQueue({changes = [], meta = {}, pageId}) {
      this.saved = false;
      let currentElementCopy = $lcloneDeep(this.getCurrentElement);
      let wpbPagesStore = useWpbPagesStore();

      let pageCopy = $lcloneDeep(wpbPagesStore.getFromStore(pageId));
      changes = changes.filter(change => change.before !== change.after);
      console.log(currentElementCopy);

      if (changes.length) {
        let payload = {
          active: true,
          saved: false,
          timestamp: new Date().toDateTimeNum(),
          meta: {
            ...meta,
            currentStateId: currentElementCopy._id,
            pathToMe: currentElementCopy.pathToMe,
            index: currentElementCopy.index,
            treePath: currentElementCopy.treePath,
          },
          changes,
        };
        saveQueue.push(payload);
        saveQueueTimer.start({
          cb: async () => {
            let queueCopy = Array.from(saveQueue);

            queueCopy = queueCopy.map(item => {
              let changes = item.changes.reduce((acc, curr) => {
                if (curr.id === currentElementCopy._id) {

                  if (curr.after === '$unset') {
                    $lunset(currentElementCopy, curr.path);
                  } else {
                    $lset(currentElementCopy, curr.path, curr.after);
                  }
                }

                $lset(curr, 'before', $lget(pageCopy, curr.meta.pathToMe + curr.path, '$unset'));
                if (curr.after === '$unset') {
                  $lunset(pageCopy, curr.meta.pathToMe + curr.path);
                } else {
                  $lset(pageCopy, curr.meta.pathToMe + curr.path, curr.after);
                }
                acc.push(curr);
                return acc;
              }, []);
              return {...item, changes};
            });
            saveQueue = [];
            let collection = $lcloneDeep(this.getCurrentDbCollection);
            let findActives;
            let currentActive;
            try {
              findActives = await collection.find({active: true}).toArray((error, items) => {
                if (error) {
                  throw error;
                }
                return items;
              });
            } catch {
              // console.log('could not find so resetting db');
              let authStore = useAuthStore();
              let user = authStore.authUser;

              let wpbProjectsStore = useWpbProjectsStore();
              let {data: projects} = await wpbProjectsStore.find({query: {_id: {$in: $lget(user, 'projects', [])}}});
              let currentProject = projects.find(item => item.pages.includes(pageId));
              // console.log('styles >> methods >> saveElement >> try find catch >> currentProject', currentProject);
              await this.setCurrentDbCollection({
                project: currentProject._id,
                user,
                page: pageId,
              });
              collection = $lcloneDeep(await this.getCurrentDbCollection);
              findActives = await collection.find({active: true}).toArray((error, items) => {
                if (error) {
                  throw error;
                }
                return items;
              });
            }

            if (findActives && findActives.length) {
              if (findActives.length > 1) {
                currentActive = findActives[findActives.length - 1];
              } else {
                currentActive = findActives[0];
              }
            }
            console.log('the active', currentActive, findActives);
            if (currentActive) {
              await collection.remove({_id: {$gt: currentActive._id}});
            }

            for (let i = 0; i < queueCopy.length; i++) {
              await collection.update({active: true}, {active: false}, error => {
                if (error) {
                  throw error;
                }
                return true;
              });
              // console.log('the currentActive', currentActive);
              await collection.insert(queueCopy[i]);
            }

            wpbPagesStore.addOrUpdate(pageCopy);

            const treePathLength = $lget(payload, 'treePath', []).length;
            if (treePathLength) {
              currentElementCopy.treePath[treePathLength - 1] = {...currentElementCopy.treePath[treePathLength - 1], ...pageCopy};
            }
            this.currentElement = currentElementCopy;
            this.executeSave({pageId});
          },
          iv: 600,
        });
      }
    },
    executeSave({pageId, interval = this.autoSaveDebounce, manualSave}) {
      saveTimer.start({
        cb: async () => {
          let authStore = useAuthStore();

          let currentActive;
          let collection = $lcloneDeep(this.getCurrentDbCollection);
          try {
            let findActives = await collection.find({active: true}).toArray((error, items) => {
              if (error) {
                throw error;
              }
              return items;
            });
            if (findActives && findActives.length) {
              if (findActives.length > 1) {
                currentActive = findActives[findActives.length - 1];
              } else {
                currentActive = findActives[0];
              }
            }
          } catch {
            let user = authStore.authUser;
            let wpbProjectsStore = useWpbProjectsStore();
            let {data: projects} = await wpbProjectsStore.find({query: {_id: {$in: $lget(user, 'projects', [])}}});
            let currentProject = projects.find(item => item.pages.includes(pageId));
            // console.log('styles >> methods >> debounceSave >> try find catch >> currentProject', currentProject);
            await this.setCurrentDbCollection({project: currentProject._id, user, page: pageId});
            collection = $lcloneDeep(this.getCurrentDbCollection);
            let findActives = await collection.find({active: true}).toArray((error, items) => {
              if (error) {
                throw error;
              }
              return items;
            });
            if (findActives && findActives.length) {
              if (findActives.length > 1) {
                currentActive = findActives[findActives.length - 1];
              } else {
                currentActive = findActives[0];
              }
            }
          }
          if (!currentActive) {
            throw Error('there is no currently active change');
          }

          let needToRevert = await collection.find({
            _id: {$gt: currentActive._id},
          }).toArray((error, items) => {
            if (error) {
              throw error;
            }
            return items;
          });
          needToRevert = needToRevert.reduceRight((acc, curr) => {
            if (acc.length) {
              acc.push(curr);
            } else if (curr.saved) {
              acc.push(curr);
            }
            return acc;
          }, []);
          // console.log('need to revert', needToRevert);

          let changesData = {};
          if (!needToRevert.length) {
            // if length is true we need to make sure that our current active object stays in sync with everything before it.
            // we need to start with the first record updating values moving up. we will need to make changes using the after field.
            let needToSave = await collection.find({
              _id: {$lt: currentActive._id},
            }).toArray((error, items) => {
              if (error) {
                throw error;
              }
              return items;
            });
            let changesToKeep = [];
            // console.log('need to save', needToSave);
            for (let i = needToSave.length - 1; i >= 0; i--) {
              if (needToSave[i].saved) break;
              changesToKeep.unshift(needToSave[i]);
            }
            // console.log('the changes to keep', changesToKeep);
            changesData = changesToKeep.reduce((acc, curr) => {
              if (acc) {
                curr.changes.forEach(item => {
                  const type = ['section', 'page'].includes(item.meta.type) ? item.meta.type : 'element';
                  if (item.after === '$unset') {
                    $lset(acc, [type, item.id, item.after, item.path], 1);
                    $lunset(acc, [type, item.id, item.path]);
                  } else {
                    $lset(acc, [type, item.id, item.path], item.after);
                    $lunset(acc, [type, item.id, '$unset', item.path]);
                  }
                  $lset(acc, [type, item.id, '_type'], item.meta.type);
                });
                return acc;
              }
            }, {});
          }
          if (needToRevert.length) {
            // if length is true then we need track changes starting with the last one in the array working down.
            // we will need to revert changes based on the before field.

            let revertChanges = [];
            for (let i = needToRevert.length - 1; i >= 0; i--) {
              if (needToRevert[i].saved) {
                revertChanges = needToRevert.slice(0, i + 1);
                break;
              }
            }
            // console.log('the revertChanges', revertChanges);
            changesData = revertChanges.reduceRight((acc, curr) => {
              if (acc) {
                curr.changes.forEach(item => {
                  const type = ['section', 'page'].includes(item.meta.type) ? item.meta.type : 'element';
                  if (item.before === '$unset') {
                    $lset(acc, [type, item.id, item.before, item.path], 1);
                    $lunset(acc, [type, item.id, item.path]);
                  } else {
                    $lset(acc, [type, item.id, item.path], item.before);
                    $lunset(acc, [type, item.id, '$unset', item.path]);
                  }
                  $lset(acc, [type, item.id, '_type'], item.meta.type);
                });
                return acc;
              }
            }, {});
          }

          let changes = currentActive.changes.filter(item => item.id === currentActive.meta.currentStateId);
          let last_change = changes[changes.length - 1];
          let wpbPagesStore = useWpbPagesStore();
          // TODO: when you select the page and try to set css classes this code breaks. meta.treePath is undefined
          let pageCopy = $lcloneDeep(wpbPagesStore.getFromStore(last_change.meta.treePath[last_change.meta.treePath.length - 1]._id));
          // let pageCopy = $lcloneDeep(getters['wpb-pages/get'](pageId));
          let currentValue = $lget(pageCopy, $lget(last_change, 'meta.pathToMe') + last_change.path);
          let activeState = 'after';
          if (currentValue === last_change.before || (!currentValue && last_change.before === '$unset')) {
            activeState = 'before';
          }

          currentActive.changes.forEach(item => {
            let currentActivetype = ['section', 'page'].includes(item.meta.type) ? item.meta.type : 'element';

            if (item[activeState] === '$unset') {
              $lset(changesData, [currentActivetype, item.id, item[activeState], item.path], 1);
              $lunset(changesData, [currentActivetype, item.id, item.path]);
            } else {
              $lset(changesData, [currentActivetype, item.id, item.path], item[activeState]);
              $lunset(changesData, [currentActivetype, item.id, '$unset', item.path]);
            }
            $lset(changesData, [currentActivetype, item.id, '_type'], item.meta.type);
          });

          // console.log('after merging data', changesData);
          let changesPayload = {
            action: 'autoSave',
            value: changesData,
          };
          const feathersAxios = axios.create({
            baseURL: process.env.VUE_APP_FEATHERS_URL || 'http://localhost:3030',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + authStore.accessToken,
            },
          });
          console.log('executeSave > changesPayload', changesPayload);
          feathersAxios.post('/wpb-management', changesPayload)
            .then(async () => {
              Notify.create({
                type: 'positive',
                timeout: 2000,
                group: 'autosave',
                message: this.autoSave ? manualSave ? 'Saved' : 'Auto Saved' : 'Saved',
              });
              collection.update({_id: currentActive._id}, {saved: true}, error => {
                if (error) {
                  throw error;
                }
                return true; /*dispatch('setUndoRedoStatus', pageId)*/
              });
              collection.update({_id: {$gt: currentActive._id}}, {saved: false}, error => {
                if (error) {
                  throw error;
                }
                return true; /*dispatch('setUndoRedoStatus', pageId)*/
              });
              this.saved = true;
            })
            .catch(err => {
              console.error('autosave error', err);
            });
        }, iv: interval,
      });
    },
    async setUndoRedoStatus(page) {
      let wpbPagesStore = useWpbPagesStore();

      let pageId = $lget(page, '_id', page);
      let pageCopy = typeof page === 'string' ? $lcloneDeep(wpbPagesStore.getFromStore(pageId)) : $lcloneDeep(page);
      if (!pageId) {
        throw Error(`dispatch: setUndoRedoStatus -- page: ${pageCopy}`);
      }
      let authStore = useAuthStore();
      let user = authStore.authUser;
      let collection = await this.setCurrentDbCollection({project: pageCopy.project, user, page: pageCopy});
      let currentActive;
      if (collection.name !== pageId) throw Error(`dispatch: setUndoRedoStatus -- collection.name !== page._id: ${collection.name} !== ${pageId}`);

      let findActives = await new Promise((resolve, reject) => {
        collection.find({active: true}).toArray((error, items) => error ? reject(error) : resolve(items));
      });

      if (findActives && findActives.length) {
        if (findActives.length > 1) {
          currentActive = findActives[findActives.length - 1];
        } else {
          currentActive = findActives[0];
        }

      }
      if (currentActive) {
        let changes = currentActive.changes.filter(item => item.id === currentActive.meta.currentStateId);
        let last_change = changes[changes.length - 1];
        let currentValue = $lget(pageCopy, $lget(last_change, 'meta.pathToMe') + last_change.path);
        let possibleUndos = await collection.find({
          _id: {$lt: currentActive._id},
        }).toArray((error, items) => {
          if (error) {
            throw error;
          }
          return items;
        });

        let possibleRedos = await collection.find({
          _id: {$gt: currentActive._id},
        }).toArray((error, items) => {
          if (error) {
            throw error;
          }
          return items;
        });

        this.undoRedoStatus = {
          redo: !!possibleRedos.length || (!possibleRedos.length && (last_change.before === currentValue || (!currentValue && last_change.before === '$unset'))),
          undo: !!possibleUndos.length || (!possibleUndos.length && (last_change.after === currentValue || (!currentValue && last_change.after === '$unset'))),
        };
      } else {
        // TODO: I am not sure this should error. If there is not a database then it should create it automatically.
        // throw Error(`dispatch: setUndoRedoStatus -- currentActive: ${currentActive}`);
      }
    },
  },
});

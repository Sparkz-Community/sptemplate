const {GeneralError} = require('@feathersjs/errors');

const {packages: {omitDeep, lodash: {lget, lset, lomit, lmerge}}} = require('@iy4u/common-utils');


/* eslint-disable no-unused-vars */
exports.WpbManagement = class WpbManagement {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
    this.percentComplete = 0;
  }

  // async find (params) {
  //   return [];
  // }
  //
  // async get (id, params) {
  //   return {
  //     id, text: `A new message with ID: ${id}!`
  //   };
  // }

  async copyPage(template = {}, params = {}, {
    ownerId,
    projectId,
    ownerModelName,
    pageName = 'New Page',
    percent,
    saveAsPage,
  }) {
    let {template: istemplate} = template;
    let data = {};
    if (istemplate) {
      data = lomit(template, ['_fastjoin', 'sections', 'template', 'ownerId', 'modelName', 'project']);
    } else {
      data = lomit(template, ['_fastjoin', 'sections', 'template', 'project']);
    }
    if (!ownerId || !ownerModelName) {
      throw GeneralError(`${ownerId ? 'ownerId' : 'ownerModelName'}: "${ownerId ? ownerId : ownerModelName}". Is not a valid ${ownerId ? 'ownerId' : 'ownerModelName'}.`);
    } else if (!projectId) {
      throw GeneralError(`projectId: "${projectId}". Is not a valid projectId.`);
    } else {
      data.project = projectId;
      data.ownerId = ownerId;
      data.modelName = ownerModelName;
      data.createdBy = ownerId;
      data.updatedBy = ownerId;
    }
    if (!pageName) {
      throw GeneralError(`pageName: "${pageName}". Is not a valid pageName.`);
    } else {
      data.name = pageName;
    }
    let page = await this.app.service('wpb-pages').create(data, {...params, $dontUpdatePage: true, $stopRelate: true});
    let sections = lget(template, '_fastjoin.sections', []);
    let section_ids = [];
    if (sections.length > 0) {
      await Promise.all(sections.map(async section => {
        let newSection = await this.copySection(page._id, section, params, {percent: percent / sections.length});
        section_ids.push(newSection._id);
      }));
      lset(page, 'sections', section_ids);
    }
    await this.app.service('wpb-pages').patch(page._id, {sections: section_ids}, {...params});
    if (!sections.length) {
      this.percentComplete += percent;
      await this.app.service('progress').emit('created', {amount: this.percentComplete.toFixed(0), _id: '0'});
    }
    return page;
  }

  async copySection(page_id, template = {}, params = {}, {
    section_parent,
    percent,
    templateAction,
    order_position,
  } = {}) {
    let {template: istemplate} = template;

    let data = {};
    if (istemplate) {
      data = lomit(template, ['_fastjoin', 'template', 'elements', 'parent', 'children']);
    } else {
      data = lomit(template, ['_fastjoin', 'template', 'elements', 'parent', 'children']);
    }
    if (section_parent) {
      lset(data, 'parent', section_parent);
    }
    lset(data, 'page', page_id);
    if (order_position) {
      lset(data, 'styles.order', order_position);
    }

    let section = await this.app.service('wpb-sections').create(data, {
      ...params,
      $dontUpdatePage: true,
      $stopRelate: true,
    });
    let elements = lget(template, '_fastjoin.elements', []);
    let children = lget(template, '_fastjoin.children', []);
    let total = elements.length + children.length;
    let element_ids = [];
    if (elements.length > 0) {
      await Promise.all(elements.map(async element => {
        let newElement = await this.copyElement(section._id, element, params, {percent: percent / total});
        element_ids.push(newElement._id);
      }));
      lset(section, 'elements', element_ids);
    }
    let children_ids = [];
    if (children.length > 0) {
      await Promise.all(children.map(async child => {
        let newSection = await this.copySection(page_id, child, params, {
          section_parent: section._id,
          percent: percent / total,
        });
        children_ids.push(newSection._id);
      }));
      lset(section, 'children', children_ids);
    }
    await this.app.service('wpb-sections').patch(section._id, {
      children: children_ids,
      elements: element_ids,
    }, {...params, $dontUpdatePage: !templateAction, $stopRelate: !templateAction});
    if (!total) {
      this.percentComplete += percent;
      await this.app.service('progress').emit('created', {amount: this.percentComplete.toFixed(0), _id: '0'});
    }
    return section;
  }

  async copyElement(section_id, template = {}, params = {}, {percent, templateAction, order_position} = {}) {
    let {template: istemplate} = template;

    let data = {};
    if (istemplate) {
      data = lomit(template, ['template', 'section']);
    } else {
      data = lomit(template, ['template', 'section']);
    }
    lset(data, 'section', section_id);
    lset(data, 'styles.order', order_position);
    let element = await this.app.service('wpb-elements').create(data, lmerge(
      {
        ...params,
      },
      {
        query: {
          _type: data._type,
        },
        $dontUpdatePage: !templateAction,
        $stopRelate: !templateAction,
      }));
    this.percentComplete += percent;
    await this.app.service('progress').emit('created', {amount: this.percentComplete.toFixed(0), _id: '0'});
    return element;
  }

  async copyNewSection(template, params = {}, parent_id) {
    let newTemplate = lomit(template, ['elements', 'children', '_fastjoin']);
    if (parent_id) {
      lset(template, 'parent', parent_id);
    } else {
      console.log('no parent id');
    }
    let section = await this.app.service('wpb-sections').create(newTemplate, {
      ...params,
      $dontUpdatePage: true,
      $stopRelate: true,
    });
    let elements = lget(template, '_fastjoin.elements', []);
    let children = lget(template, '_fastjoin.children', []);
    let element_ids = [];
    if (elements.length > 0) {
      for (let item of elements) {
        let newElement = await this.copyNewElement(item, section._id, params)
          .catch(err => {
            console.log('REEEE SUM TING WONG', err);
          });
        console.log('new element', newElement);
        element_ids.push(newElement._id);
      }
    }
    let children_ids = [];
    if (children.length > 0) {
      for (let item of children) {
        lset(item, 'template', true);
        let newSection = await this.copyNewSection(item, section._id, params)
          .catch(err => {
            console.log('REEEE SUM TING WONG', err);
          });
        children_ids.push(newSection._id);
      }
    }
    section = await this.app.service('wpb-sections').patch(section._id, {
      children: children_ids,
      elements: element_ids,
    }, {...params, $dontUpdatePage: true, $stopRelate: true});
    return section;
  }

  async copyNewElement(data, section_id, params = {}) {
    lset(data, 'section', section_id);
    lset(data, 'template', true);
    lset(data, 'baseElement', false);
    lset(data, 'devTemplate', false);
    lset(data, 'isPublic', false);
    let element = await this.app.service('wpb-elements').create(data, lmerge(
      {
        ...params,
      },
      {
        query: {
          _type: data._type,
        },
        $dontUpdatePage: true,
        $stopRelate: true,
      }))
      .catch(err => {
        console.log('sumthang is brokan', err);
      });
    return element;
  }

  async createRootElement(data, page_id, params = {}) {
    let existingElement = data['value'];
    lset(existingElement, 'section', null);
    let newSectionOrder = data['order_position'];
    let newSectionData = {
      styles: {
        order: newSectionOrder,
        display: 'flex',
        'justify-content': 'center',
        'align-content': 'center',
      },
      page: page_id,
    };
    let newSection = await this.app.service('wpb-sections').create(newSectionData, {...params, $dontUpdatePage: true});
    let newSectionId = lget(newSection, '_id');
    if (newSectionId) {
      let patchData = {
        section: newSectionId,
        'styles.order': 0,
      };
      let element = await this.app.service('wpb-elements').patch(existingElement['_id'], patchData, {
        ...params,
        query: {
          _type: existingElement['_type'],
        },
        $dontUpdatePage: true,
      });
      lset(newSection, 'elements', [element._id]);
    }
    return newSection;
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    switch (data.action) {
      case 'duplicateTemplate': {
        let result;

        if (!data['templateAction']) {
          throw GeneralError(`data.templateAction: "${data['templateAction']}". Is not a valid templateAction.`);
        }
        switch (data['templateAction']) {
          case 'pageTemplate': {
            let entity;
            if (data.value === 'blank') {
              entity = {
                styles: {display: 'flex', 'justify-content': 'center'},
                _fastjoin: {
                  sections: [
                    {
                      styles: {order: 0, display: 'flex', 'justify-content': 'center'},
                      _fastjoin: {
                        elements: [
                          {
                            _type: 'text',
                            content: 'Start by adding something',
                            styles: {order: 0, 'font-size': '72px'},
                          },
                        ],
                      },
                    },
                  ],
                },
              };
            } else {
              if (Array.isArray(data.value)) {
                console.log('\n\n\n\n\nwe are going to find the pages', data.value, '\n\n\n\n\n');
                entity = await this.app.service('wpb-pages').find({
                  ...params,
                  query: {_id: {$in: data.value}},
                  paginate: false,
                });
              } else {
                console.log('\n\n\n\n\nwe are going to get the page', data.value, '\n\n\n\n\n');
                entity = await this.app.service('wpb-pages').get(data.value, {...params});
              }
              if (Array.isArray(entity) && !entity.length) {
                throw GeneralError(`pageIds: "${entity}". There are no records found.`);
              } else if (!Array.isArray(entity) && !entity) {
                throw GeneralError(`pageId: "${entity}". There is no record found.`);
              }
            }
            let template = omitDeep(entity, ['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']);
            const pageName = lget(data, 'pageName', 'New Page');
            const projectId = data['projectId'];
            let ownerId = lget(data, 'ownerId');
            let ownerModelName = lget(data, 'ownerModel');
            if (!ownerId) {
              ownerId = lget(params, 'user._id');
              ownerModelName = 'users';
            }
            if (Array.isArray(template)) {
              let new_templates = [];
              for (let item of template) {
                new_templates.push(await this.copyPage(item, params, {
                  ownerId,
                  projectId,
                  ownerModelName,
                  pageName,
                  percent: 100 / template.length,
                }));
              }
              result = new_templates;
            } else {
              const newPage = await this.copyPage(template, params, {
                ownerId,
                projectId,
                ownerModelName,
                pageName,
                percent: 100,
              });
              const getPage = await this.app.service('wpb-pages').get(newPage._id, {...params});
              this.app.service('wpb-pages').emit('updated', getPage);
              result = newPage;
            }
            break;
          }
          case 'sectionTemplate': {
            let order_position = data['order_position'] || 0;
            let entity;
            if (Array.isArray(data.value)) {
              console.log('\n\n\n\n\nwe are going to find the sections', data.value, '\n\n\n\n\n');
              entity = await this.app.service('wpb-sections').find({
                ...params,
                query: {_id: {$in: data.value}},
                paginate: false,
              });
            } else {
              console.log('\n\n\n\n\nwe are going to get the section', data.value, '\n\n\n\n\n');
              entity = await this.app.service('wpb-sections').get(data.value, {...params})
                .catch(err => console.error('getting section error', err));
            }
            if (Array.isArray(entity) && !entity.length) {
              console.error('get section err', entity);

              throw GeneralError(`pageIds: "${entity}". There are no records found.`);
            } else if (!Array.isArray(entity) && !entity) {
              console.error('get section err', entity);
              throw GeneralError(`pageId: "${entity}". There is no record found.`);
            }
            let template = omitDeep(entity, ['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']);
            let page_id = data['page_id'];
            let parent_id = data['parent_id'];
            if (!page_id) {
              throw GeneralError(`data.page_id: "${data['page_id']}". Is not a valid page_id.`);
            }
            if (Array.isArray(template)) {
              let newOrders = Array.isArray(order_position);
              let new_templates = [];
              for (let [item, index] of template) {
                if (parent_id) {
                  new_templates.push(await this.copySection(page_id, item, params, {
                    section_parent: parent_id,
                    percent: 100 / template.length,
                    templateAction: true,
                    order_position: newOrders ? order_position[index] : 0,
                  }));
                } else {
                  new_templates.push(await this.copySection(page_id, item, params, {
                    percent: 100,
                    templateAction: true,
                    order_position: newOrders ? order_position[index] : 0,
                  }));
                }
              }
              result = new_templates;
            } else {
              if (parent_id) {
                result = await this.copySection(page_id, template, params, {
                  section_parent: parent_id,
                  percent: 100,
                  templateAction: true,
                  order_position,
                });
              } else {
                result = await this.copySection(page_id, template, params, {
                  percent: 100,
                  templateAction: true,
                  order_position,
                });
              }
            }
            break;
          }
          case 'elementTemplate': {
            let order_position = data['order_position'] || 0;
            if (typeof data.value === 'string') {
              data.value = await this.app.service('wpb-elements').get(data.value, {...params})
                .catch(err => console.error('getting element error', err));
            }
            let template = omitDeep(data.value, ['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']);
            let section_id = data['section_id'];
            if (!section_id) {
              throw GeneralError(`data.section_id: "${data['section_id']}". Is not a valid section_id.`);
            }
            if (Array.isArray(template)) {
              let newOrders = Array.isArray(order_position);
              let new_templates = [];
              for (let [item, index] of template) {
                new_templates.push(await this.copyElement(section_id, item, params, {
                  percent: 100 / template.length,
                  templateAction: true,
                  order_position: newOrders ? order_position[index] : 0,
                }));
              }
              result = new_templates;
            } else {
              result = await this.copyElement(section_id, template, params, {
                percent: 100,
                templateAction: true,
                order_position,
              });
            }
            break;
          }
          case 'rootElement': {
            let pageId = data['page_id'];
            let existingTemplate = omitDeep(data.value, ['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'ownerId', 'baseElement', 'template', 'devTemplate', 'section', 'isPublic']);
            let ownerId = lget(data, 'ownerId');
            if (!ownerId) {
              ownerId = lget(params, 'user._id');
            }
            let newSectionOrder = data['order_position'];
            let newSectionData = {
              styles: {
                order: newSectionOrder,
                display: 'flex',
                'justify-content': 'center',
                'align-content': 'center',
              },
              page: pageId,
              ownerId,
            };
            let newSection = await this.app.service('wpb-sections').create(newSectionData, {...params});
            let newSectionId = lget(newSection, '_id');
            if (newSectionId) {
              lset(existingTemplate, 'section', newSectionId);
              lset(existingTemplate, 'ownerId', ownerId);
              lset(existingTemplate, 'styles.order', 0);
              let element = await this.app.service('wpb-elements').create(existingTemplate, {
                ...params,
                query: {
                  _type: existingTemplate['_type'],
                },
              });
              lset(newSection, 'elements', [element._id]);
            }
            return newSection;
          }
          default: {
            throw GeneralError(`data.templateAction: "${data['templateAction']}". Is not a valid templateAction.`);
          }
        }
        this.percentComplete = 0;
        await this.app.service('progress').emit('created', {amount: this.percentComplete, _id: '0'});
        return result;
      }
      case 'createRootElement': {
        let pageId = data['page_id'];
        let existingElement = data['value'];
        lset(existingElement, 'section', undefined);
        let newSectionOrder = data['order_position'];
        let newSectionData = {
          styles: {
            order: newSectionOrder,
            display: 'flex',
            'justify-content': 'center',
            'align-content': 'center',
          },
          page: pageId,
        };
        let newSection = await this.app.service('wpb-sections').create(newSectionData, {...params});
        let newSectionId = lget(newSection, '_id');
        if (newSectionId) {
          let patchData = {
            section: newSectionId,
            'styles.order': 0,
          };
          let element = await this.app.service('wpb-elements').patch(existingElement['_id'], patchData, {
            ...params,
            query: {
              _type: existingElement['_type'],
            },
          });
          lset(newSection, 'elements', [element._id]);
        }
        return newSection;
      }
      case 'treeChanges': {
        const {page_id} = data;
        if (!page_id) throw GeneralError(`data.page_id: "${data['page_id']}". Please provide a valid page_id.`);
        let {rootElements, sections, elements} = data['value'];
        return await Promise.all([
          Promise.all(rootElements.map(async item => {
            return await this.createRootElement(item, page_id, params);
          })),
          Promise.all(elements.map(async item => {
            if (!item['_type']) throw new Error(`treeChanges > patch > wpb-elements > ${item._id} > _type is not set: "${item['_type']}"`);
            return await this.app.service('wpb-elements').patch(item._id, item.changes, {
              ...params,
              query: {
                _type: item['_type'],
              },
              $dontUpdatePage: true,
            });
          })),
          Promise.all(sections.map(async item => {
            return await this.app.service('wpb-sections').patch(item._id, item.changes, {
              ...params,
              $dontUpdatePage: true,
            });
          })),
        ])
          .then(async (res) => {
            let page = await this.app.service('wpb-pages').get(page_id, {...params});
            if (page) {
              this.app.service('wpb-pages').emit('updated', page);
              return {result: res, pageStatus: 'updated'};
            } else {
              return {result: res, pageStatus: 'pageNotFound'};
            }
          })
          .catch(err => {
            throw err;
          });
      }
      case 'makeElementTemplate': {
        let template = omitDeep(data.value, ['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'section']);
        let newElement = this.app.service('wpb-elements').create(template, {...params, query: {_type: template._type}, $dontUpdatePage: true});
        return newElement;
      }
      case 'makeSectionTemplate': {
        let entity;
        entity = await this.app.service('wpb-sections').find({
          ...params,
          query: {_id: {$in: data.value.id}},
          paginate: false,
        });
        let newEntity = entity[0];
        let bata = lomit(newEntity, ['_id', 'page', 'parent']);
        console.log('bata', bata);
        lset(bata, 'styles.order', 0);
        bata.template = data.value.template;
        bata.isPublic = data.value.isPublic;
        bata.baseSection = data.value.baseSection;
        bata.devTemplate = data.value.devTemplate;
        bata.icon = data.value.icon;
        bata.name = data.value.name;
        bata.ownerId = data.value.ownerId;
        console.log('this is the entity', bata);
        let template = omitDeep(bata, ['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'page', 'parent', 'section']);
        console.log('its hitting the backend', template._fastjoin);
        console.log('its hitting the backend data', data.value);
        return await this.copyNewSection(template, params);
      }
      // case 'makePageTemplate': {
      //   let newPage = {
      //     isPublic: data.value.isPublic,
      //     template: data.value.template,
      //     name: data.value.name,
      //     styles: data.value.styles,
      //     classes: data.value.classes,
      //     stylingChoices: data.value.stylingChoices,
      //     sections: []
      //   };
      //   let sections = lget(data, 'children', []);
      //   let section_ids = [];
      //   await Promise.all(sections.map(async section => {
      //     let newSection = await this.copySection(section, {percent: 100 / sections.length});
      //     section_ids.push(newSection._id);
      //   }));
      //   console.log('this is hitting the makePageTemplate', section_ids);
      //   break;
      // }
      case 'autoSave': {
        const changesData = data['value'];
        const pagesService = this.app.service('wpb-pages');
        const sectionsService = this.app.service('wpb-sections');
        const elementsService = this.app.service('wpb-elements');
        let saveParams = {$dontUpdatePage: true, $stopRelate: true};

        return await Promise.all(Object.keys(changesData).map(async key => {
          let changes = changesData[key];
          if (key === 'element') {
            return Promise.all(Object.keys(changes).map(changeId => {
              console.log('element thang', changes);
              return elementsService.patch(changeId, changes[changeId], {
                ...params,
                ...saveParams,
                query: {_type: changes[changeId]._type},
              });
            }));
          } else if (key === 'page') {
            return Promise.all(Object.keys(changes).map(changeId => {
              delete changes[changeId]._type;
              return pagesService.patch(changeId, changes[changeId], {...params, ...saveParams});
            }));
          } else {
            return Promise.all(Object.keys(changes).map(changeId => {
              delete changes[changeId]._type;
              return sectionsService.patch(changeId, changes[changeId], {...params, ...saveParams});
            }));
          }
        }))
          .catch(err => {
            console.error('autosave error', err);
            return err;
          });
      }
      case 'publication': {
        const page_id = lget(data, ['value', 'page_id']);
        if (!page_id) throw GeneralError(`page_id: "${page_id}". You must provide a page_id.`);
        const entity = await this.app.service('wpb-pages').get(page_id, {...params});
        if (!entity) {
          throw GeneralError(`page_id: "${entity}". There is no record found.`);
        }
        const sectionCompiler = (arr) => {
          return new Promise((resolve, reject) => {
            Promise.all(arr.map(async (item) => {
              let sections = lget(item, '_fastjoin.children', []);
              let elements = lget(item, '_fastjoin.elements', []);
              if (sections.length) {
                sections = await sectionCompiler(sections);
              }
              lset(item, 'children', sections);
              lset(item, 'elements', elements);
              return item;
            }))
              .then(res => resolve(res))
              .catch(err => reject(err));
          });
        };
        const entitySections = lget(entity, '_fastjoin.sections', []);
        if (entitySections.length) {
          lset(entity, 'sections', await sectionCompiler(entitySections));
        }
        let template = omitDeep(entity, ['_fastjoin', 'tree_children']);
        lset(data, 'value.page', template);
        const publicationService = this.app.service('wpb-page-publications');

        return publicationService.create(data['value'], {...params})
          .catch(err => {
            console.error('\n\n\nthe publication create error\n', err, '\n\n\n\n');
            return err;
          });
      }
      default: {
        throw GeneralError(`data.action: "${data.action}". Is not a valid action.`);
      }
    }
  }

  // async update (id, data, params) {
  //   return data;
  // }
  //
  // async patch (id, data, params) {
  //   return data;
  // }
  //
  // async remove (id, params) {
  //   return { id };
  // }
};

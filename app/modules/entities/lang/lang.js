// @flow
const ODM = require('../crud/odm');
const Model = require('./models/langs');
const Mapping = require('../crud/mapping');
const Config_ = require('../../../config');

const mapping = new Mapping(Model.Mapping);

class Lang extends ODM {
    static get model(): Object {
        return Model;
    }

    static get mapping(): Object {
        return mapping;
    }

    static get index(): string {
        return `${Config_.elasticsearch.index_prefix}_lang`;
    }

    static get type(): string {
        return 'lang';
    }
}

module.exports = Lang;

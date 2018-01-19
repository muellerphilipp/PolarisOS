const LangMixin = require('../../../common/mixins/LangMixin');
const APIRoutes = require('../../../common/api/routes');
const FormMixin = require('../../../common/mixins/FormMixin');

module.exports = {
    mixins: [LangMixin, FormMixin],
    data() {
        return {
            state: {
                pread_path: APIRoutes.entity('publication', 'POST', true),
                aread_path: APIRoutes.entity('author', 'POST', true),
                forms: {
                    asink: 'authors_sink',
                    arsink: 'authors_read_sink',
                },
            },
        };
    },
    methods: {
    },
};

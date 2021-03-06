const WidgetMixin = require('../../../../../../common/mixins/WidgetMixin');

module.exports = {
    mixins: [WidgetMixin],
    props: {
        extraClasses: { required: false, default: '', type: String },
        infos: { required: true, default: () => [], type: Array },
    },
    computed: {
        stats() {

        },
    },
};

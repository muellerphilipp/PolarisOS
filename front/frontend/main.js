const Vue = require('vue');
const router = require('./router');
const store = require('./store');

const Loader = require('./components/loader/Loader.vue');
const Stepper = require('./components/themes/ined/components/stepper/Stepper.vue');
const Input = require('./components/themes/ined/components/forms/elements/input/Input.vue');
const Select = require('./components/themes/ined/components/forms/elements/select/Select.vue');
const VariadicElement = require('./components/themes/ined/components/forms/elements/variadic_element/VariadicElement.vue');
const Form = require('./components/themes/ined/components/forms/form/Form.vue');

const App = require('./pages/App.vue');

Vue.component('loader', Loader);
Vue.component('stepper', Stepper);
Vue.component('fform', Form);
Vue.component('finput', Input);
Vue.component('fselect', Select);
Vue.component('fvariadic-element', VariadicElement);

new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App),
});

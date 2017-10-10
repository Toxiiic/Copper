const copper = new Copper();
//绑定键盘
copper.bindKeyboard();

const vm = new Vue({
    el: '#app'
    , data: {
        osc1: {
            type: 'sine',
            lfo: 5
        }
    },
    computed: {
        setOsc1Type: function (type) {
            copper.osc1.type = type;
        }
    }
});
const copper = new Copper();
//绑定键盘
copper.bindKeyboard();

const vm = new Vue({
    el: '#app'
    , data: {
        osc1: {
            type: 'sine',
        }
        , lfo: 5
    },
    computed: {
        setOsc1Type: function () {
            copper.synth.osc1.type = this.osc1.type;
            copper.synth.lfo = this.lfo;
            // return copper.synth.lfo;
        }
    }
});
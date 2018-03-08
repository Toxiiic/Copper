import Voice from './voice';
import VirtualKeyboard from './virtualKeyboard';

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const key2num = {
    'q': 0,
    'w': 2,
    'e': 4,
    'r': 5,
    't': 7,
    'y': 9,
    'u': 11,
    'i': 12,
    'o': 14,
    'p': 16,
    '[': 17,
    ']': 19,
    '2': 1,
    '3': 3,
    '5': 6,
    '6': 8,
    '7': 10,
    '9': 13,
    '0': 15,
    '=': 18,
    // 'Q': 0,
    // 'W': 2,
    // 'E': 4,
    // 'R': 5,
    // 'T': 7,
    // 'Y': 9,
    // 'U': 11,
    // 'I': 12,
    // 'O': 14,
    // 'P': 16,
    'a': -19,
    's': -17,
    'd': -15,
    'f': -13,
    'g': -12,
    'h': -10,
    'j': -8,
    'k': -7,
    'l': -5,
    ';': -3,
    '\'': -1

}

// function bindKeys(voices) {
//     document.onkeydown = function(keyboardEvent) {
//         let num = key2num[keyboardEvent.key];
//         if(num == undefined) {
//             return;
//         }
//         console.log(keyboardEvent.keyCode);

//         //找闲的voice的下标
//         let idleVoiceIndex = virtualKeyboard.keyDown(num);
//         if(idleVoiceIndex == -1) {
//             return;
//         }
//         //闲的voice发声
//         voices[idleVoiceIndex].noteOn(num);
//     };
//     document.onkeyup = function(keyboardEvent) {
//         let num = key2num[keyboardEvent.key];
//         let voiceIndex = virtualKeyboard.keyUp(num);
//         voices[voiceIndex].noteOff();
//         console.log(`off {voiceIndex}`);
//     };
// }

/**
 * Copper的合成器参数
 * osc
 */
export default class Copper {
    constructor () {
        //为了防止外部掉用函数导致函数内this不是copper
        const copper = this;
        /* 合成器向外暴露的参数 */
        this.synth = {
            osc1: {
                set type (val) {
                    //1.新创建的voice的数据
                    //2.当前voice要挨个更改
                    for(let i in copper._numVoiceMap) {
                        copper._numVoiceMap[i].type = val;
                    }
                }
            }
            , osc2: {
                type: 'sine',
            }
            , set mix (val) {
                // for(let i in copper._numVoiceMap) {
                //     copper._numVoiceMap[i].type = value;
                // }
            }
            , set lfo (val) {
                for(let i in copper._numVoiceMap) {
                    copper._numVoiceMap[i]._gainLfo.value = val;
                    console.log(copper._numVoiceMap[i]._gainLfo.value);
                }
            }
            , filter: {
                set cutOff (val) {
                    for(let i in copper._numVoiceMap) {
                        copper._numVoiceMap[i]._biquadFilter.frequency.value = val;
                    }
                },
                lfo: 0.1
            }
            , adsr: {
                attack: 0.3,
                decay: 0.5,
                sustain: 0.6,
                retain: 1
            }
            , mainGain: 1
            , reverb: 10
            // , set [synthProp](val) {
            // }

        }

        
        //voice 的数量
        this.voiceAmount = 5;

        //TODO 怎样保护以下这些不想暴露给用户的变量呢
        this._mainGain = audioCtx.createGain();
        this._mainGain.connect(audioCtx.destination);

        //一开始创建默认数量个voice
        // this._voices = new Array(this.voices).fill(null).map((value)=>{
        //     return new Voice(audioCtx, this._mainGain)
        // });
        //虚拟键盘
        this.virtualKeyboard = new VirtualKeyboard(this.voiceAmount);
        //暂存在场voices
        this._numVoiceMap = {};


        //TODO 要给this.osc1.type搞个set。难道要给所有的属性都搞个set？
        //set的时候，写入this.options，new voice的时候传入。
    }

    /*
        将键盘事件与此copper绑定
    */
    bindKeyboard () {
        
        //因为如果不用变量保存copper的话，之后在回调函数里this就不是copper了，就拿不到copper了
        let copper = this;
        
        document.onkeydown = function(keyboardEvent) {
            let num = key2num[keyboardEvent.key];
            //是否已经被按下 是否已满max 是否是有声键，这三个都要判断且不通过的频率由高到低
            //效率重要，但是保持正确是原则。所以还是应该注意顺序的正确性
            if(Object.keys(copper._numVoiceMap).includes(`${num}`) || num == undefined) {
                return;
            }
            let notFull = copper.virtualKeyboard.keyDown(num);
            if(!notFull) {
                return;
            }
            //通过则new voice
            //TODO copper.options 里是要传入新改变的参数
            let voice = new Voice(audioCtx, copper._mainGain, copper.options);
            //记录map
            copper._numVoiceMap[num] = voice;
            //发声
            voice.noteOn(num);
        };
        document.onkeyup = function(keyboardEvent) {
            let num = key2num[keyboardEvent.key];
            if(num == undefined) {
                return;
            }
            copper.virtualKeyboard.keyUp();
            // let voiceIndex = ;
            copper._numVoiceMap[num].noteOff();
            //踢出去
            delete copper._numVoiceMap[num];
        };
    }

    set (prop, value) {
        for(let i in this._numVoiceMap) {
            this._numVoiceMap[i][prop] = value;
        }
    }
}

//add a dev version text here.



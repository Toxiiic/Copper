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
    'Q': 0,
    'W': 2,
    'E': 4,
    'R': 5,
    'T': 7,
    'Y': 9,
    'U': 11,
    'I': 12,
    'O': 14,
    'P': 16
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


export default class Copper {
    constructor () {
        //copper参数
        this.config = {

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
        this._voiceNumMap = {BLANK: 0};
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
            if(Object.keys(copper._voiceNumMap).includes(`${num}`) || num == undefined) {
                return;
            }
            let notFull = copper.virtualKeyboard.keyDown(num);
            if(!notFull) {
                return;
            }
            //通过则new voice
            let voice = new Voice(audioCtx, copper._mainGain);
            //记录map
            copper._voiceNumMap[num] = voice;
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
            copper._voiceNumMap[num].noteOff();
            //踢出去
            delete copper._voiceNumMap[num];

            console.log(`off {voiceIndex}`);
        };
    }
}



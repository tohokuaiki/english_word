<template>
  <div id="app" class="container">
    <div class="row">
      <div class="offset-md-3 col-md-6">
        <h1>英単語をタイピングで覚えましょう。</h1>
        <div v-if="finish_flag" class="text-center">
          <img src="images/kusudama.png">
          <h3>全問正解おめでとう！ - {{ process_time }}</h3>
          <div>
            <button class="btn btn-primary mr-3" @click="retry();">もう一度やる</button>
            <button class="btn btn-secondary mr-3" @click="init();">単語を変更する</button>
          </div>
        </div>
        <div v-else-if="word_list.english.length > 0">
          <h2>下にタイプしましょう。{{ answer_index + 1 }}/{{ word_list.english.length }}) - {{ process_time }}</h2>
          <div class="alert alert-primary" role="alert">
            <span class="alert-link">{{ word_list.japanese[answer_index] }}</span>
          </div>
          <div class="input-group">
            <input type="text" class="form-control" v-model="input_word" ref="input_word" @keyup="catchKey">
            <div class="input-group-append">
              <a class="btn btn-secondary" type="button" @click.prevent="showHint">ヒント</a>
            </div>
          </div>
          <div class="text-center mt-3">
            <button class="btn btn-warning" @click="giveup()">ギブアップ</button>
          </div>
          <b-modal v-model="show_hint" id="hint-modal">
            <p class="text-center" style="font-size: 1.4em; color:#ddd;transform: scale(2);">{{ hint_literal }}</p>
          </b-modal>
        </div>
        <div v-else>
          <h2>英単語を登録</h2>
          <p>Monday,月曜日<br>Tuesday,火曜日<br>のように1行ずつカンマ区切り</p>
          <textarea class="form-control" v-model="list_input" style="height: 22em;"></textarea>
          <div class="text-center mt-3">
            <button class="btn btn-primary" @click="register_list">登録して開始</button>
          </div>
          <div class="mt-3">
            <h4>サンプル</h4>
            <button class="btn btn-outline-secondary mr-1" @click="sampleWords('week')">曜日</button>
            <button class="btn btn-outline-secondary mr-1" @click="sampleWords('month')">月</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sound from './components/Sound';

const hint_interval = 800;
export default {
  name: 'App',
  components: {},
  data() {
    return {
      finish_flag: false,
      input_word: "",
      show_hint: false,
      answer_index: 0,
      timer_counter: {
        counter: 0, timer: null
      },
      word_list: {
        english: [],
        japanese: []
      },
      list_input: ""
    };
  },
  watch: {
    finish_flag(after){
      if (after === true){
        this.counter(false);
      }
      return null;
    }
  },
  methods: {
    focusInput(){
      let input_word = this.$refs.input_word;
      if (input_word){
        input_word.focus();
      }
    },
    retry() {
      if (this.timer_counter.timer){
        clearInterval(this.timer_counter.timer);
      }
      this.finish_flag = false;
      this.input_word = "";
      this.show_hint = false;
      this.answer_index = 0;
      this.timer_counter = {
        counter: 0, timer: null
      };
      this.counter(true);
      this.$nextTick(()=>{
        this.focusInput();
      });
    },
    giveup(){
      this.retry();
      this.word_list = {
        english: [],
        japanese: []
      };
    },
    init() {
      this.giveup();
      this.list_input = "";
    },
    counter(start = true) {
      if (start) {
        this.timer_counter.counter = 0;
        this.timer_counter.timer = setInterval(() => {
          this.timer_counter.counter++;
        }, 1000);
      } else {
        clearInterval(this.timer_counter.timer)
      }
    },
    catchKey() {
      let input_ok = "";
      let answer_w = this.word_list.english[this.answer_index];
      let input_w = this.input_word;
      for (let i = 0, j = input_w.length; i < j; i++) {
        if (answer_w.substr(i, 1).toLowerCase()
            === input_w.substr(i, 1).toLowerCase()) {
          input_ok += answer_w.substr(i, 1);
        } else {
          Sound.ng();
        }
        this.input_word = "";
        this.focusInput();
        this.input_word = input_ok;
        if (input_ok === answer_w) {
          this.input_word = "";
          if (this.answer_index + 1 === this.word_list.english.length) {
            Sound.finish();
            this.finish_flag = true;
          } else {
            Sound.ok();
            this.answer_index++;
          }
        }
      }
    },
    showHint() {
      this.show_hint = true;
      setTimeout(() => {
        this.show_hint = false;
      }, hint_interval);
    },
    register_list() {
      this.word_list.english = [];
      this.word_list.japanese = [];
      this.list_input.split("\n").forEach((value) => {
        let cell = value.split(",");
        if (cell.length === 2) {
          this.word_list.english.push(cell[0]);
          this.word_list.japanese.push(cell[1]);
        }
      });
      if (this.word_list.english.length > 0) {
        this.$nextTick(() => {
          this.focusInput();
        });
      }
      this.retry();
    },
    sampleWords(type) {
      switch (type) {
        case "week":
          this.list_input = "Sunday,日曜日\nMonday,月曜日\nTuesday,火曜日\nWednesday,水曜日\nThursday,木曜日\nFriday,金曜日\nSaturday,土曜日\n"
          break;
        case "month":
          this.list_input = "January,1月\nFebruary,2月\nMarch,3月\nApril,4月\nMay,5月\nJune,6月\nJuly,7月\nAugust,8月\nSeptember,9月\nOctober,10月\nNovember,11月\nDecember,12月\n";
          break;
      }

    }
  },
  mounted() {
    this.$root.$on('bv::modal::hide', (bvEvent, modalId) => {
      if (modalId === 'hint-modal') {
        this.$nextTick(() => {
          this.focusInput();
        });
      }
    });
  },
  computed: {
    hint_literal: function () {
      if (this.word_list.english.length > 0) {
        let word = this.word_list.english[this.answer_index];
        if (word.length > this.input_word.length) {
          return word[this.input_word.length];
        }
      }
      return "";
    },
    process_time: function (){
      let str = "";
      let min = Math.floor(this.timer_counter.counter/60);
      if (min){
        str += min + "分";
      }
      return str +  this.timer_counter.counter % 60 + "秒";
    }
  }
}
</script>
<style>
#app h1{
  margin-top: 1vh;
  font-size: 1.8em;
}
#app h2{
  margin-top: 1vh;
  font-size: 1.6em;
}
#app h3{
  margin-top: 1vh;
  font-size: 1.4em;
}
#app img{
  max-width: 95%;
}
#hint-modal .modal-header {
  display: none;
}

#hint-modal .modal-footer {
  display: none;
}
</style>
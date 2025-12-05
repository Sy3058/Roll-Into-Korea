<template>
  <div class="board-wrapper">

    <!-- 중앙 주사위 영역 -->
    <div class="dice-area" @click="rollDice" :class="{ rolling: isRolling }">
      <div class="dice-row">
        <div class="dice dice1" :class="'show-' + dice1">
          <div class="dot pos1"></div>
          <div class="dot pos2"></div>
          <div class="dot pos3"></div>
          <div class="dot pos4"></div>
          <div class="dot pos5"></div>
          <div class="dot pos6"></div>
          <div class="dot pos7"></div>
          <div class="dot pos8"></div>
          <div class="dot pos9"></div>
        </div>

        <div class="dice dice2" :class="'show-' + dice2">
          <div class="dot pos1"></div>
          <div class="dot pos2"></div>
          <div class="dot pos3"></div>
          <div class="dot pos4"></div>
          <div class="dot pos5"></div>
          <div class="dot pos6"></div>
          <div class="dot pos7"></div>
          <div class="dot pos8"></div>
          <div class="dot pos9"></div>
        </div>
      </div>
      <div v-if="!isRolling" class="dice-text">🎲 클릭해서 굴리기</div>
    </div>

    <!-- 실제 게임판 -->
    <div class="board">
      <template v-for="i in gridCount" :key="i">

        <div 
          v-if="isOuterCell(i - 1)"
          class="cell"
          :class="[
            cells[getOuterIndex(i - 1)].type,
            getShapeClass(getOuterIndex(i - 1))
          ]"
          @click="goToCity(cells[getOuterIndex(i - 1)])">

          <!-- 말 표시 -->
          <div v-if="playerPos === getOuterIndex(i - 1)" class="piece">🔵</div>

          <!-- START -->
          <template v-if="cells[getOuterIndex(i - 1)].type === 'start'">
            <div class="cell-title">START</div> 🚩
          </template>

          <!-- 국가 -->
          <template v-else-if="cells[getOuterIndex(i - 1)].type === 'country'">
            <img class="flag" :src="cells[getOuterIndex(i - 1)].flag" />
            <div class="cell-country">{{ cells[getOuterIndex(i - 1)].country }}</div>
            <div class="cell-city">{{ cells[getOuterIndex(i - 1)].city }}</div>
          </template>

          <!-- 황금열쇠 -->
          <template v-else-if="cells[getOuterIndex(i - 1)].type === 'goldenKey'">
            <div class="cell-title">황금열쇠</div> ⭐
          </template>

          <!-- 무인도 -->
          <template v-else-if="cells[getOuterIndex(i - 1)].type === 'island'">
            <div class="cell-title">무인도</div> 🏝️
          </template>

        </div>

        <div v-else class="empty"></div>
      </template>
    </div>
  </div>
</template>


<script>
import JSConfetti from 'js-confetti'

export default {
  name: "Board",
  data() {
    return {
      rows: 5,
      cols: 7,

      // 국가 데이터
      cityData: [
        { country: "대한민국", city: "서울", flag: "https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg", type: "country" },
        { country: "일본", city: "도쿄", flag: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg", type: "country" },
        { country: "중국", city: "베이징", flag: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg", type: "country" },
        { country: "미국", city: "뉴욕", flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg", type: "country" },
        { country: "영국", city: "런던", flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg", type: "country" },
        { country: "프랑스", city: "파리", flag: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg", type: "country" },
        { country: "독일", city: "베를린", flag: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg", type: "country" },
        { country: "이탈리아", city: "로마", flag: "https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg", type: "country" },
        { country: "스페인", city: "마드리드", flag: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg", type: "country" },
        { country: "캐나다", city: "토론토", flag: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg", type: "country" },
        { country: "브라질", city: "리우데자네이루", flag: "https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg", type: "country" },
        { country: "호주", city: "시드니", flag: "https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg", type: "country" },
        { country: "러시아", city: "모스크바", flag: "https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg", type: "country" },
        { country: "멕시코", city: "멕시코시티", flag: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg", type: "country" },
        { country: "인도", city: "뉴델리", flag: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg", type: "country" },
        { country: "네덜란드", city: "암스테르담", flag: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg", type: "country" },
        { country: "스위스", city: "취리히", flag: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg", type: "country" }
      ],

      specialTiles: [
        { type: "goldenKey" },
        { type: "island" }
      ],

      cells: [],
      playerPos: 0,
      dice1: 1,
      dice2: 1,
      isRolling: false
    };
  },

  computed: {
    gridCount() {
      return this.rows * this.cols;
    }
  },

  created() {
    this.cells = this.generateOuterCells(20);
  },

  methods: {
    generateOuterCells(count) {
      const fullPool = [...this.cityData, ...this.specialTiles];
      const arr = [];

      arr.push({ type: "start" }); // 0번

      for (let i = 1; i < count; i++) {
        arr.push(fullPool[Math.floor(Math.random() * fullPool.length)]);
      }
      return arr;
    },

    goToCity(cell) {
      if (cell.type !== 'country') return; // 도시가 아닌 칸 클릭 시 무시
      
      this.$router.push({
        name: "CityIntro",
        params: { city: cell.city }
      });
    },


    getShapeClass(idx) {
      if (idx === 0 || idx === 6 || idx === 10 || idx === 17) return "corner";
      if ((idx > 0 && idx < 6) || (idx > 10 && idx < 17)) return "horizontal";
      return "vertical";
    },

    animateMove(steps) {
      let moved = 0;

      const jsConfetti = new JSConfetti();

      const willCompleteLap = (this.playerPos + steps) >= 20;

      const interval = setInterval(() => {
        this.playerPos = (this.playerPos + 1) % 20;
        moved++;

        if (moved >= steps) {
          clearInterval(interval);

          if (willCompleteLap) {
            jsConfetti.addConfetti();
          }
        }
      }, 180);
    },

    rollDice() {
      if (this.isRolling) return;

      this.isRolling = true;

      const animationInterval = setInterval(() => {
        this.dice1 = Math.floor(Math.random() * 6) + 1;
        this.dice2 = Math.floor(Math.random() * 6) + 1;
      }, 100);

      setTimeout(() => {
        clearInterval(animationInterval);

        const final1 = Math.floor(Math.random() * 6) + 1;
        const final2 = Math.floor(Math.random() * 6) + 1;

        this.dice1 = final1;
        this.dice2 = final2;

        this.animateMove(final1 + final2);
        this.isRolling = false;
      }, 1200);
    },

    isOuterCell(i) {
      const row = Math.floor(i / this.cols);
      const col = i % this.cols;

      return (
        row === 0 ||
        col === 0 ||
        row === this.rows - 1 ||
        col === this.cols - 1
      );
    },

    getOuterIndex(i) {
      const row = Math.floor(i / this.cols);
      const col = i % this.cols;

      const lastRow = this.rows - 1; 
      const lastCol = this.cols - 1;

      if (row === 0) return col;
      if (col === lastCol) return 7 + (row - 1);
      if (row === lastRow) return 10 + (lastCol - col);
      if (col === 0) return 17 + (lastRow - 1 - row);

      return null;
    }
  }
};
</script>


<style scoped>
.board-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.dice-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.dice-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
}

.dice-text {
  font-size: 14px;
  white-space: nowrap;
  margin-top: 8px;
  text-align: center;
  position: static;
}

.dice {
  width: 60px;
  height: 60px;
  background: white;
  border: 2px solid #444;
  border-radius: 10px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 1s;
}

.rolling .dice {
  animation: roll 0.4s infinite;
}

@keyframes roll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  50% { transform: rotateX(180deg) rotateY(90deg); }
  100% { transform: rotateX(360deg) rotateY(180deg); }
}


.board {
  display: grid;
  grid-template-columns:
    150px 110px 110px 110px 110px 110px 150px; 
  grid-template-rows:
    150px 110px 110px 110px 150px;
  gap: 4px;
}

.cell {
  position: relative;
  background: #f8f8f8;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.flag {
  width: 40px;
  height: 26px;
  object-fit: cover;
  margin-bottom: 5px;
}

.piece {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 28px;
  z-index: 5; /* 낮추기 */
  pointer-events: none;
}

/* 주사위 점 */
.dice .dot {
  width: 10px;
  height: 10px;
  background: black;
  border-radius: 50%;
  position: absolute;
}

.dot.pos1 { top: 10px; left: 10px; }
.dot.pos2 { top: 10px; left: 25px; }
.dot.pos3 { top: 10px; right: 10px; }

.dot.pos4 { top: 25px; left: 10px; }
.dot.pos5 { top: 25px; left: 25px; }
.dot.pos6 { top: 25px; right: 10px; }

.dot.pos7 { bottom: 10px; left: 10px; }
.dot.pos8 { bottom: 10px; left: 25px; }
.dot.pos9 { bottom: 10px; right: 10px; }

/* 숫자 표현 */
.dice.show-1 .dot { opacity: 0; }
.dice.show-1 .pos5 { opacity: 1; }

.dice.show-2 .dot { opacity: 0; }
.dice.show-2 .pos1,
.dice.show-2 .pos9 { opacity: 1; }

.dice.show-3 .dot { opacity: 0; }
.dice.show-3 .pos1,
.dice.show-3 .pos5,
.dice.show-3 .pos9 { opacity: 1; }

.dice.show-4 .dot { opacity: 0; }
.dice.show-4 .pos1,
.dice.show-4 .pos3,
.dice.show-4 .pos7,
.dice.show-4 .pos9 { opacity: 1; }

.dice.show-5 .dot { opacity: 0; }
.dice.show-5 .pos1,
.dice.show-5 .pos3,
.dice.show-5 .pos5,
.dice.show-5 .pos7,
.dice.show-5 .pos9 { opacity: 1; }

.dice.show-6 .dot { opacity: 0; }
.dice.show-6 .pos1,
.dice.show-6 .pos3,
.dice.show-6 .pos4,
.dice.show-6 .pos6,
.dice.show-6 .pos7,
.dice.show-6 .pos9 { opacity: 1; }
</style>

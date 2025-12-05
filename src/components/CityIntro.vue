<template>
  <div class="city-wrapper">
    <h1 class="city-title">{{ city }}</h1>

    <img v-if="info" :src="info.flag" class="flag-img" />

    <p class="city-desc">
      {{ info.description }}
    </p>

    <button class="back-btn" @click="$router.push('/')">
      ← 돌아가기
    </button>
  </div>
</template>

<script>
export default {
  name: "CityIntro",
  props: ["city"],
  data() {
    return {
      cities: {
        "서울": {
          flag: "https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg",
          description: "대한민국의 수도이자 현대와 전통이 공존하는 도시입니다."
        },
        "도쿄": {
          flag: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg",
          description: "일본의 수도로, 세계적인 대도시 문화와 기술의 중심지입니다."
        },
        "베이징": {
          flag: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg",
          description: "중국의 수도로, 만리장성과 자금성 등 역사 유산이 유명합니다."
        },
        "뉴욕": {
          flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
          description: "미국의 대표 도시로 금융, 패션, 문화의 중심지입니다."
        },
        "런던": {
          flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
          description: "영국의 수도로, 유럽 문화와 역사의 중심입니다."
        }
        // 나머지 도시는 필요하면 추가 가능
      }
    }
  },
  computed: {
    info() {
      return this.cities[this.city] || {
        flag: "",
        description: `${this.city} 소개 준비 중입니다!`
      };
    }
  }
};
</script>

<style scoped>
.city-wrapper {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
  font-family: 'Pretendard', sans-serif;
}

.city-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
}

.flag-img {
  width: 120px;
  height: auto;
  margin-bottom: 20px;
}

.city-desc {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 40px;
}

.back-btn {
  padding: 12px 20px;
  border: none;
  background: #4b79ff;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.back-btn:hover {
  background: #335eea;
}
</style>

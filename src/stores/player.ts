import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { gameApi } from '@/api/gameApi';
import type { BuyItemRequest } from '@/types/game';

export const usePlayerStore = defineStore(
  'player',
  () => {
    // State
    const money = ref(0); // 초기 자금
    const inventory = ref<any[]>([]); // 보유 아이템 목록
    const isTransactionPending = ref(false); // 결제 진행 중 여부

    // 계산된 상태
    const formattedMoney = computed(() => money.value.toLocaleString());

    // Actions

    /**
     * 아이템 구매
     * UI에서 호출하면 서비스 레이어를 통해 결제를 진행하고 상태를 업데이트함
     */
    const buyItem = async (item: BuyItemRequest) => {
      if (isTransactionPending.value) return false;

      // 1차 검증 (돈 부족한지 확인)
      if (money.value < item.cost) {
        alert('돈이 부족합니다!');
        return false;
      }

      isTransactionPending.value = true;
      try {
        const response = await gameApi.buyItem(item);

        if (response.success) {
          money.value = response.data.money;
          inventory.value.push(item);
          return true;
        } else {
          alert(response.message);
          return false;
        }
      } catch (error) {
        console.error('구매 실패:', error);
        return false;
      } finally {
        isTransactionPending.value = false;
      }
    };

    return {
      money,
      inventory,
      isTransactionPending,
      formattedMoney,
      buyItem,
    };
  },
  {
    persist: true,
  },
);

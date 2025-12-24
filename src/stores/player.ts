import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ShopItem } from '@/types/quest';
import { shopService } from '@/services/shopService';

export const usePlayerStore = defineStore(
  'player',
  () => {
    // State
    const money = ref(300000); // 초기 자금
    const inventory = ref<ShopItem[]>([]); // 보유 아이템 목록
    const isTransactionPending = ref(false); // 결제 진행 중 여부

    // 계산된 상태
    const formattedMoney = computed(() => money.value.toLocaleString());

    // Actions

    /**
     * 아이템 구매 액션
     * UI에서 호출하면 서비스 레이어를 통해 결제를 진행하고 상태를 업데이트함
     */
    async function buyItem(item: ShopItem): Promise<boolean> {
      // 중복 요청 방지 (이미 처리 중이면 무시)
      if (isTransactionPending.value) return false;

      // 유효성 검사 (잔액 확인)
      if (money.value < item.price) {
        return false;
      }

      isTransactionPending.value = true; // 로딩 시작

      try {
        // 서비스 레이어 호출 (비즈니스 로직 위임)
        const newBalance = await shopService.purchaseItem(
          item.id,
          item.name,
          item.category,
          item.price,
          money.value,
        );

        // 성공 시 상태 업데이트 (잔액 갱신 및 인벤토리 추가)
        money.value = newBalance;
        inventory.value.push(item);
        return true; // 구매 성공
      } catch (error) {
        console.error('구매 실패:', error);
        return false; // 구매 실패
      } finally {
        isTransactionPending.value = false; // 로딩 종료
      }
    }

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

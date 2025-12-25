import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { gameApi } from '@/api/gameApi';
import type { BuyItemRequest, ShopItem } from '@/types/game';
import { journeyApi } from '@/api/journeyApi';

export interface InventoryItem extends ShopItem {
  badgeId: number;
}

export const usePlayerStore = defineStore(
  'player',
  () => {
    // State
    const money = ref(0); // 초기 자금
    const inventory = ref<InventoryItem[]>([]); // 보유 아이템 목록
    const isTransactionPending = ref(false); // 결제 진행 중 여부

    // 서버 동기화 상태
    const level = ref(1);
    const levelName = ref('');
    const maxCapacity = ref(10);

    // Getters
    const formattedMoney = computed(() => money.value.toLocaleString());
    const isBagFull = computed(() => inventory.value.length >= maxCapacity.value);

    // Actions

    /**
     * Journey 데이터 동기화
     */
    const fetchJourneyData = async () => {
      try {
        const response = await journeyApi.fetchJourney();
        if (response.success) {
          const data = response.data;

          // 상태 업데이트
          level.value = data.level;
          levelName.value = data.levelName;
          maxCapacity.value = data.levelCapacity;

          console.log(`내 정보 불러오기 완료: Lv.${data.level}`);
        }
      } catch (error) {
        console.error('Journey 데이터 로드 실패:', error);
      }
    };

    /**
     * 아이템 구매
     */
    const buyItem = async (item: ShopItem) => {
      if (isTransactionPending.value) return false;

      // 1차 검증 (돈 부족한지 확인)
      if (money.value < item.cost) {
        alert('돈이 부족합니다!');
        return false;
      }

      // 2차 검증
      if (isBagFull.value) {
        alert(`가방이 가득 찼습니다. (${inventory.value.length}/${maxCapacity.value})`);
        return false;
      }

      isTransactionPending.value = true;
      try {
        // API 요청용 데이터 생성
        const payload: BuyItemRequest = {
          name: item.name,
          cost: item.cost,
          category: item.category,
        };

        const response = await gameApi.buyItem(payload);

        if (response.success) {
          money.value = response.data.money;

          // 인벤토리에 badgeId 포함하여 추가
          const newItem: InventoryItem = {
            ...item,
            badgeId: response.data.badgeId,
          };
          inventory.value.push(newItem);
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

    /**
     * 아이템 기부
     */
    const donateItem = async (badgeId: number) => {
      if (isTransactionPending.value) return false;

      if (!confirm('정말로 이 아이템을 기부하시겠습니까?')) return false;

      isTransactionPending.value = true;
      try {
        const response = await gameApi.donateItem(badgeId);

        if (response.success) {
          // 인벤토리에서 해당 badgeId 가진 아이템 제거
          inventory.value = inventory.value.filter((i) => i.badgeId !== badgeId);
          alert('기부가 완료되었습니다.');
          return true;
        } else {
          alert(response.message);
          return false;
        }
      } catch (error) {
        console.error('기부 실패:', error);
        return false;
      } finally {
        isTransactionPending.value = false;
      }
    };

    return {
      money,
      inventory,
      isTransactionPending,
      level,
      levelName,
      maxCapacity,
      formattedMoney,
      isBagFull,
      fetchJourneyData,
      buyItem,
      donateItem,
    };
  },
  {
    persist: true,
  },
);

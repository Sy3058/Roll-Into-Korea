import type { ItemCategory } from '@/types/quest';

// 네트워크 지연을 흉내 내기 위한 유틸 함수
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const shopService = {
  /**
   * 아이템 구매 요청
   * @param itemId 아이템 ID
   * @param itemName 아이템 이름
   * @param category 카테고리
   * @param price 가격
   * @param currentBalance 현재 사용자의 잔액 (검증용)
   * @returns 구매 후 남은 잔액 (성공 시)
   * @throws 잔액 부족 등의 에러
   */
  async purchaseItem(
    itemId: number,
    itemName: string,
    category: ItemCategory,
    price: number,
    currentBalance: number,
  ): Promise<number> {
    // 지금은 더미 로직
    // 요청 데이터 확인
    console.log(`[구매 요청] ${category} | ${itemName}(ID:${itemId}) - ₩${price}`);

    // 0.5초 동안 통신하는 척 기다림 (로딩 상태 테스트용)
    await delay(500);

    // 서버 측 유효성 검사 흉내 (잔액 확인)
    if (currentBalance < price) {
      throw new Error('잔액이 부족합니다.');
    }

    // 성공 시 차감된 잔액 반환
    return currentBalance - price;
  },
};

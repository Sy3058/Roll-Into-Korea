// 게임 저장, 로드, 점수 전송 API
import type { LandmarkTripData } from '@/types/quest';
import axios from './axios';
import type {
  ApiResponse,
  BuyItemRequest,
  BuyItemResponse,
  DonateRequest,
  DonateResponse,
  GameInitData,
  RewardRequest,
  RewardResponse,
} from '@/types/game';

// URL 주소
const ENDPOINTS = {
  INIT: '/game',
  REWARD: '/game/reward',
  ITEM: '/game/item',
  DONATE: '/game/donate',
};

export const gameApi = {
  /**
   * 게임 초기 데이터 불러오기 (Map, User Status, Landmarks)
   * @returns GameInitData
   */
  fetchGameInit: async (): Promise<ApiResponse<GameInitData>> => {
    return await axios.get(ENDPOINTS.INIT);
  },

  /**
   * 여행지 도착 보상 (POST)
   * @param landmarkId
   * @returns
   */
  claimReward: async (amount: number): Promise<ApiResponse<RewardResponse>> => {
    const payload: RewardRequest = { amount };
    return await axios.post(ENDPOINTS.REWARD, payload);
  },

  /**
   * 여행지 내부 장소 받아오기
   * @param landmarkId - 여행지 Id
   * @returns
   */
  getLandmarkDetail: async (landmarkId: string): Promise<ApiResponse<LandmarkTripData>> => {
    return await axios.get(`/game/landmark/${landmarkId}`);
  },

  /**
   * 아이템 구매
   * @param payload
   * @returns
   */
  buyItem: async (payload: BuyItemRequest): Promise<ApiResponse<BuyItemResponse>> => {
    return await axios.post(ENDPOINTS.ITEM, payload);
  },

  /**
   * 아이템 기부
   * @param badgeId
   * @returns
   */
  donateItem: async (badgeId: number): Promise<ApiResponse<DonateResponse>> => {
    const payload: DonateRequest = { badgeId };
    return await axios.post(ENDPOINTS.DONATE, payload);
  },
};

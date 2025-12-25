// 게임 저장, 로드, 점수 전송 API
import axios from './axios';
import type {
  ApiResponse,
  BuyItemRequest,
  BuyItemResponse,
  DonateRequest,
  DonateResponse,
  GameExitData,
  GameInitData,
  LandmarkMapData,
  RewardRequest,
  RewardResponse,
} from '@/types/game';

// URL 주소
const ENDPOINTS = {
  INIT: '/game',
  REWARD: '/game/reward',
  ITEM: '/game/item',
  DONATE: '/game/donate',
  LANDMARK_MAP: (id: string) => `/map/landmark/${id}`,
  EXIT: '/game/exit',
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

  /**
   * 특정 여행지의 맵 데이터 가져오기
   * @param landmarkId
   * @returns
   */
  fetchLandmarkMap: async (landmarkId: string): Promise<ApiResponse<LandmarkMapData>> => {
    return await axios.get(ENDPOINTS.LANDMARK_MAP(landmarkId));
  },

  /**
   * 여행 종료 및 정산 요청
   */
  exitGame: async (): Promise<ApiResponse<GameExitData>> => {
    return await axios.post(ENDPOINTS.EXIT);
  },
};

import axios from './axios';
import type { ApiResponse, JourneyData } from '@/types/game';

const ENDPOINTS = {
  JOURNEY: '/journey',
};

export const journeyApi = {
  /**
   * 내 여행 정보 가져오기
   */
  fetchJourney: async (): Promise<ApiResponse<JourneyData>> => {
    return await axios.get(ENDPOINTS.JOURNEY);
  },
};

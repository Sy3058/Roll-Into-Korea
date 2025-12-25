import type { ApiBoundaryPoint } from '@/types/quest';

export const useGeofencing = () => {
  /**
   * 백엔드 좌표 배열을 받아서 카카오맵 Path로 변환
   */
  const getBoundaryPath = (points: ApiBoundaryPoint[]) => {
    if (!window.kakao || !window.kakao.maps) return [];

    const kakao = window.kakao.maps;
    // points가 없을 경우 대비
    if (!points || points.length === 0) return [];

    return points.map((p) => new kakao.LatLng(p.lat, p.lng));
  };

  // 플레이어가 지정된 구역 내에 있는지 확인
  const isPointInPolygon = (point: kakao.maps.LatLng, path: kakao.maps.LatLng[]): boolean => {
    const x = point.getLng();
    const y = point.getLat();
    let inside = false;

    for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
      const xi = path[i]!.getLng(),
        yi = path[i]!.getLat();
      const xj = path[j]!.getLng(),
        yj = path[j]!.getLat();
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  return { getBoundaryPath, isPointInPolygon };
};

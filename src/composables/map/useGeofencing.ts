// 구역 제한
export const useGeofencing = () => {
  // 경복궁 영역 좌표
  const getBoundaryPath = () => {
    const kakao = window.kakao.maps;
    return [
      new kakao.LatLng(37.5832, 126.9747), // 좌상단
      new kakao.LatLng(37.5832, 126.9802), // 우상단
      new kakao.LatLng(37.5763, 126.9802), // 우하단
      new kakao.LatLng(37.5763, 126.9747), // 좌하단
    ];
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

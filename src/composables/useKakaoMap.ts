import { ref } from 'vue';
import { useKakaoLoader } from './map/useKakaoLoader';
import { useGeofencing } from './map/useGeofencing';
import { useMapWalker } from './map/useMapWalker';
import { useQuestSystem } from './map/useQuestSystem';

export const useKakaoMap = () => {
  const map = ref<kakao.maps.Map | null>(null);
  const roadview = ref<kakao.maps.Roadview | null>(null);

  // UI 상태 관리
  const isWarningVisible = ref(false);
  const warningMsg = ref('');
  let warningTimeout: number | undefined = undefined;

  // 상태 변경 헬퍼
  const showToast = (msg: string) => {
    warningMsg.value = msg;
    isWarningVisible.value = true;
    if (warningTimeout) clearTimeout(warningTimeout);
    warningTimeout = setTimeout(() => (isWarningVisible.value = false), 2000);
  };

  // 모듈 가져오기
  const { loadScript } = useKakaoLoader();
  const { getBoundaryPath, isPointInPolygon } = useGeofencing();
  const { createWalker, updateWalkerPosition, updateWalkerRotation } = useMapWalker();
  const { initQuests, updateQuestVisibility } = useQuestSystem(showToast);

  let lastValidPanoId: number | null = null;
  let boundaryPath: kakao.maps.LatLng[] = [];

  const initialize = async (mapContainer: HTMLElement, rvContainer: HTMLElement) => {
    try {
      await loadScript();
      window.kakao.maps.load(() => {
        const kakao = window.kakao.maps;
        const startPosition = new kakao.LatLng(37.578611, 126.977222); // 경복궁 시작점

        // 미니맵 생성
        map.value = new kakao.Map(mapContainer, { center: startPosition, level: 4 });
        map.value!.setDraggable(true);
        map.value!.setZoomable(true);

        // 구역 설정 (경복궁)
        boundaryPath = getBoundaryPath();
        new kakao.Polygon({
          map: map.value,
          path: boundaryPath,
          strokeWeight: 2,
          strokeColor: '#FF0000',
          fillColor: '#FF0000',
          fillOpacity: 0.15,
        });

        // 로드뷰 생성
        roadview.value = new kakao.Roadview(rvContainer);
        const rvClient = new kakao.RoadviewClient();

        // 워커(아이콘) 생성
        const walker = createWalker(startPosition);
        walker!.setMap(map.value);

        // 로드뷰 위치 변경
        kakao.event.addListener(roadview.value, 'position_changed', () => {
          const newPos = roadview.value!.getPosition();
          const currentPanoId = roadview.value!.getPanoId();

          if (isPointInPolygon(newPos, boundaryPath)) {
            // 구역 안인 경우 이동
            lastValidPanoId = currentPanoId;
            map.value!.setCenter(newPos);
            updateWalkerPosition(newPos);
            updateQuestVisibility(roadview.value!); // 퀘스트 거리 체크
          } else {
            // 구역 밖으로 이탈하는 경우 warning msg 표시
            showToast('지정된 영역을 벗어날 수 없습니다.');
            if (lastValidPanoId) {
              roadview.value!.setPanoId(lastValidPanoId, roadview.value!.getPosition());
            }
          }
        });

        // 로드뷰 시점 변경 -> 워커 회전
        kakao.event.addListener(roadview.value, 'viewpoint_changed', () => {
          const viewpoint = roadview.value!.getViewpoint();
          updateWalkerRotation(viewpoint.pan);
        });

        // // 미니맵 클릭 -> 순간이동 (현재는 불가능하게 둠)
        // kakao.event.addListener(map.value, 'click', (mouseEvent: kakao.maps.MouseEvent) => {
        //   const clickPos = mouseEvent.latLng;
        //   if (!isPointInPolygon(clickPos, boundaryPath)) {
        //     showToast('이동할 수 없는 지역입니다.');
        //     return;
        //   }
        //   rvClient.getNearestPanoId(clickPos, 50, (panoId: number | null) => {
        //     if (panoId) roadview.value!.setPanoId(panoId, clickPos);
        //   });
        // });

        // 초기 실행
        rvClient.getNearestPanoId(startPosition, 50, (panoId: number | null) => {
          if (panoId) {
            roadview.value!.setPanoId(panoId, startPosition);
            lastValidPanoId = panoId;

            // 로드뷰가 준비된 후 퀘스트 마커 올리기
            initQuests();
            updateQuestVisibility(roadview.value!);
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  return { initialize, isWarningVisible, warningMsg };
};

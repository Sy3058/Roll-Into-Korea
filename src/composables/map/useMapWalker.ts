// 미니맵 아이콘
import { ref } from 'vue';

export const useMapWalker = () => {
  const mapWalker = ref<kakao.maps.CustomOverlay | null>(null);
  let walkerContent: HTMLElement | null = null;

  const createWalker = (position: kakao.maps.LatLng) => {
    const content = document.createElement('div');
    content.className = 'MapWalker';

    // CSS로 아이콘 생성
    content.innerHTML = `
      <div class="angleBack"></div>
      <div class="figure"></div>
    `;

    walkerContent = content;

    mapWalker.value = new window.kakao.maps.CustomOverlay({
      position: position,
      content: content,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });

    return mapWalker.value;
  };

  const updateWalkerPosition = (position: kakao.maps.LatLng) => {
    mapWalker.value?.setPosition(position);
  };

  const updateWalkerRotation = (angle: number) => {
    if (walkerContent) {
      walkerContent.style.transform = `rotate(${angle}deg)`;
    }
  };

  return { mapWalker, createWalker, updateWalkerPosition, updateWalkerRotation };
};

export const useKakaoLoader = () => {
  const API_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

  const loadScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&libraries=services,clusterer&autoload=false`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Kakao Map Script loading failed'));
      document.head.appendChild(script);
    });
  };

  return { loadScript };
};

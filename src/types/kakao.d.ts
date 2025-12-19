/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 전역 네임스페이스 선언 (프로젝트 전역에서 접근 가능)
 */
declare namespace kakao.maps {
  export class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number, options?: { animate: boolean | { duration: number } }): void;
    getLevel(): number;
    panTo(latlng: LatLng): void;
    addListener(type: string, callback: (mouseEvent: MouseEvent) => void): void;
    setDraggable(draggable: boolean): void;
    setZoomable(zoomable: boolean): void;
  }

  export class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  export interface MapOptions {
    center: LatLng;
    level: number;
    draggable?: boolean;
    scrollwheel?: boolean;
    disableDoubleClickZoom?: boolean;
  }

  export class Roadview {
    constructor(container: HTMLElement, options?: RoadviewOptions);
    setPanoId(panoId: number, position: LatLng): void;
    getPosition(): LatLng;
    addListener(type: string, callback: () => void): void;
    getPanoId(): number;
    getViewpoint(): Viewpoint;
  }

  export interface Viewpoint {
    pan: number;
    tilt: number;
    zoom: number;
  }

  export interface RoadviewOptions {
    panoId?: number;
    panoX?: number;
    panoY?: number;
    pan?: number;
    tilt?: number;
    zoom?: number;
  }

  export class RoadviewClient {
    getNearestPanoId(
      position: LatLng,
      radius: number,
      callback: (panoId: number | null) => void,
    ): void;
  }

  export interface MouseEvent {
    latLng: LatLng;
    point: Point;
  }

  export class Point {
    constructor(x: number, y: number);
  }

  export class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | Roadview | null): void;
    setPosition(position: LatLng): void;
    getContent(): HTMLElement;
  }

  export class Polygon {
    constructor(options: any);
    setMap(map: Map | null): void;
  }

  export interface CustomOverlayOptions {
    clickable?: boolean;
    content: string | HTMLElement;
    map?: Map | Roadview;
    position: LatLng;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }

  export namespace event {
    function addListener(target: any, type: string, handler: (event: any) => void): void;
  }

  export function load(callback: () => void): void;
}

/**
 * Window 인터페이스 확장
 */
interface Window {
  kakao: any;
}

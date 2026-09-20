export {};

declare global {
  namespace kakao.maps {
    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setBounds(bounds: LatLngBounds): void;
      setCenter(latlng: LatLng): void;
      relayout(): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }

    interface PolylineOptions {
      path: LatLng[];
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: string;
    }

    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
    }

    function load(callback: () => void): void;
  }

  interface Window {
    kakao?: {
      maps: typeof kakao.maps;
    };
  }
}

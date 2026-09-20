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
      scrollwheel?: boolean;
      draggable?: boolean;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setBounds(bounds: LatLngBounds): void;
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
      relayout(): void;
      addControl(control: ZoomControl, position: number): void;
    }

    class ZoomControl {
      constructor();
    }

    const ControlPosition: {
      RIGHT: number;
    };

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

    interface CustomOverlayOptions {
      map?: Map;
      position: LatLng;
      content: string | HTMLElement;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
    }

    function load(callback: () => void): void;

    namespace services {
      const Status: {
        OK: string;
        ZERO_RESULT: string;
        ERROR: string;
      };

      type PlacesSearchStatus = string;

      type AddressSearchResult = {
        x: string;
        y: string;
        address_name?: string;
      };

      type KeywordSearchResult = {
        x: string;
        y: string;
        place_name?: string;
      };

      class Geocoder {
        addressSearch(
          address: string,
          callback: (result: AddressSearchResult[], status: PlacesSearchStatus) => void,
        ): void;
      }

      class Places {
        keywordSearch(
          keyword: string,
          callback: (result: KeywordSearchResult[], status: PlacesSearchStatus) => void,
        ): void;
      }
    }
  }

  interface Window {
    kakao?: {
      maps: typeof kakao.maps;
    };
  }
}

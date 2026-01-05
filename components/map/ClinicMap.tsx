'use client';

import { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface ClinicMapProps {
  latitude: number;
  longitude: number;
  clinicName: string;
  address?: string;
  height?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 37.5665, // 서울시청 기본 좌표
  lng: 126.9780,
};

export function ClinicMap({
  latitude,
  longitude,
  clinicName,
  address,
  height = '400px',
}: ClinicMapProps) {
  const center = useMemo(
    () => ({
      lat: Number(latitude),
      lng: Number(longitude),
    }),
    [latitude, longitude]
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Google Maps API 키가 설정되지 않았습니다.</p>
          <p className="text-sm text-gray-500">
            .env.local 파일에 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 추가하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border" style={{ height }}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ ...mapContainerStyle, height }}
          center={center}
          zoom={15}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          <Marker
            position={center}
            title={clinicName}
            label={{
              text: clinicName,
              color: '#000',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}


import { Platform } from 'react-native';
import MapView, {
  MapViewProps,
  PROVIDER_GOOGLE,
  LatLng,
  PROVIDER_DEFAULT,
  Marker,
  Polyline
} from 'react-native-maps';
import { IconBox } from '../IconBox';
import { Car, FlagCheckered } from 'phosphor-react-native';
import { useRef } from 'react';
import { useTheme } from 'styled-components/native';

type Props = MapViewProps & {
  coordinates: LatLng[];
};

export function Map({ coordinates, ...rest }: Props) {
  const { COLORS } = useTheme();
  const mapRef = useRef<MapView>(null);
  const lastCoordanetes = coordinates[coordinates.length - 1];

  async function onMapLoaded() {
    if (coordinates.length > 1) {
      mapRef.current?.fitToSuppliedMarkers(['derpature', 'arrival'], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }
      });
    }
  }

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      style={{ width: '100%', height: 200 }}
      region={{
        latitude: lastCoordanetes.latitude,
        longitude: lastCoordanetes.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }}
      onMapLoaded={onMapLoaded}
      {...rest}
    >
      <Marker identifier="derpature" coordinate={coordinates[0]}>
        <IconBox size="SMALL" icon={Car} />
      </Marker>

      {coordinates.length > 1 && (
        <>
          <Marker identifier="arrival" coordinate={lastCoordanetes}>
            <IconBox size="SMALL" icon={FlagCheckered} />
          </Marker>
          <Polyline
            coordinates={[...coordinates]}
            strokeColor={COLORS.GRAY_700}
            strokeWidth={7}
          />
        </>
      )}
    </MapView>
  );
}

import React, { useEffect, useRef } from 'react';
import { AttributionControl, MapContainer } from 'react-leaflet';

import cn from 'classnames';
import { type Map as LeafletMap } from 'leaflet';

import { useIsPdf } from 'src/hooks/useIsPdf';
import { MapEditGeometries } from 'src/layout/Map/features/editableGeometries/MapEditGeometries';
import { useMapGeometryBounds } from 'src/layout/Map/features/fixedGeometries/hooks';
import { MapGeometries } from 'src/layout/Map/features/fixedGeometries/MapGeometries';
import { MapLayers } from 'src/layout/Map/features/layers/MapLayers';
import { MapSingleMarker } from 'src/layout/Map/features/singleMarker/MapSingleMarker';
import classes from 'src/layout/Map/MapComponent.module.css';
import { DefaultBoundsPadding, DefaultFlyToZoomLevel, getMapStartingView, isLocationValid } from 'src/layout/Map/utils';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { Location } from 'src/layout/Map/config.generated';

type MapProps = {
  baseComponentId: string;
  markerLocation?: Location;
  setMarkerLocation?: (location: Location) => void;
  readOnly: boolean;
  animate?: boolean;
  className?: string;
};

export function Map({
  baseComponentId,
  markerLocation,
  setMarkerLocation,
  className,
  readOnly,
  animate = true,
}: MapProps) {
  const map = useRef<LeafletMap | null>(null);
  const { centerLocation: customCenterLocation, zoom: customZoom } = useExternalItem(baseComponentId, 'Map');

  const isPdf = useIsPdf();
  const markerLocationIsValid = isLocationValid(markerLocation);

  const geometryBounds = useMapGeometryBounds(baseComponentId);
  const { center, zoom, bounds } = getMapStartingView(markerLocation, customCenterLocation, customZoom, geometryBounds);

  useEffect(() => {
    if (markerLocationIsValid) {
      map.current?.flyTo({ lat: markerLocation.latitude, lng: markerLocation.longitude }, DefaultFlyToZoomLevel, {
        animate,
      });
    }
  }, [animate, markerLocationIsValid, markerLocation]);

  useEffect(() => {
    if (bounds) {
      map.current?.fitBounds(bounds, { padding: DefaultBoundsPadding, animate });
    }
  }, [bounds, animate]);

  return (
    <MapContainer
      ref={map}
      className={cn(classes.map, { [classes.mapReadOnly]: readOnly, [classes.print]: isPdf }, className)}
      center={center}
      zoom={zoom}
      bounds={bounds}
      boundsOptions={{ padding: DefaultBoundsPadding, maxZoom: DefaultFlyToZoomLevel }}
      minZoom={3}
      maxBounds={[
        [-90, -200],
        [90, 200],
      ]}
      fadeAnimation={animate}
      zoomControl={!readOnly}
      dragging={!readOnly}
      touchZoom={!readOnly}
      doubleClickZoom={!readOnly}
      scrollWheelZoom={!readOnly}
      attributionControl={false}
    >
      <MapEditGeometries />
      <MapLayers baseComponentId={baseComponentId} />
      <MapGeometries
        baseComponentId={baseComponentId}
        readOnly={readOnly}
      />
      <MapSingleMarker
        markerLocation={markerLocation}
        setMarkerLocation={setMarkerLocation}
        readOnly={readOnly}
      />
      <AttributionControl prefix={false} />
    </MapContainer>
  );
}

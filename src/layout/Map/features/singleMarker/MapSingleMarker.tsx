import React from 'react';
import { Marker, useMapEvent } from 'react-leaflet';

import { icon } from 'leaflet';
import Icon from 'leaflet/dist/images/marker-icon.png';
import RetinaIcon from 'leaflet/dist/images/marker-icon-2x.png';
import IconShadow from 'leaflet/dist/images/marker-shadow.png';

import { isLocationValid, locationToTuple } from 'src/layout/Map/utils';
import type { Location } from 'src/layout/Map/config.generated';

const markerIcon = icon({
  iconUrl: Icon,
  iconRetinaUrl: RetinaIcon,
  shadowUrl: IconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onClick }: { onClick: (location: Location) => void }) {
  useMapEvent('click', (event) => {
    if (!event.originalEvent.defaultPrevented) {
      const location = event.latlng.wrap();
      onClick({ latitude: location.lat, longitude: location.lng });
    }
  });

  return null;
}

type MapMarkerProps = {
  markerLocation: Location | undefined;
  setMarkerLocation: ((location: Location) => void) | undefined;
  readOnly: boolean;
};

export function MapSingleMarker({ markerLocation, setMarkerLocation, readOnly }: MapMarkerProps) {
  const markerLocationIsValid = isLocationValid(markerLocation);

  return (
    <>
      {setMarkerLocation && !readOnly && <MapClickHandler onClick={setMarkerLocation} />}
      {markerLocationIsValid ? (
        <Marker
          position={locationToTuple(markerLocation)}
          icon={markerIcon}
          eventHandlers={
            !readOnly && setMarkerLocation
              ? {
                  click: () => {},
                  dragend: (e) => {
                    const { lat, lng } = e.target._latlng;
                    setMarkerLocation({ latitude: lat, longitude: lng });
                  },
                }
              : undefined
          }
          interactive={!readOnly}
          draggable={!readOnly}
          keyboard={!readOnly}
        />
      ) : null}
    </>
  );
}

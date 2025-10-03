import React, { useCallback } from 'react';

import cn from 'classnames';

import { DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { MarkerLocationText } from 'src/layout/Map/features/singleMarker/MarkerLocationText';
import { Map } from 'src/layout/Map/Map';
import classes from 'src/layout/Map/MapComponent.module.css';
import { parseLocation } from 'src/layout/Map/utils';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { Location } from 'src/layout/Map/config.generated';

export function MapComponent({ baseComponentId }: PropsFromGenericComponent<'Map'>) {
  const isValid = useIsValid(baseComponentId);
  const { readOnly, dataModelBindings } = useItemWhenType(baseComponentId, 'Map');
  const markerBinding = dataModelBindings.simpleBinding;
  const indexedId = useIndexedId(baseComponentId);

  const { formData, setValue } = useDataModelBindings(dataModelBindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');
  const markerLocation = parseLocation(formData.simpleBinding as string | undefined);

  const setMarkerLocation = useCallback(
    ({ latitude, longitude }: Location) => {
      const d = 6;
      setValue('simpleBinding', `${latitude.toFixed(d)},${longitude.toFixed(d)}`);
    },
    [setValue],
  );

  return (
    <ComponentStructureWrapper
      baseComponentId={baseComponentId}
      label={{
        baseComponentId,
        renderLabelAs: 'span',
        className: classes.label,
      }}
    >
      <div
        data-testid={`map-container-${indexedId}`}
        className={cn({ [classes.mapError]: !isValid })}
      >
        <Map
          baseComponentId={baseComponentId}
          markerLocation={markerLocation}
          setMarkerLocation={markerBinding ? setMarkerLocation : undefined}
          readOnly={readOnly ?? false}
        />
      </div>
      {markerBinding && <MarkerLocationText location={markerLocation} />}
    </ComponentStructureWrapper>
  );
}

import { useMemo } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { calculateBounds, parseGeometries } from 'src/layout/Map/utils';
import { useDataModelBindingsFor, useExternalItem } from 'src/utils/layout/hooks';
import type { Geometry, RawGeometry } from 'src/layout/Map/types';

export function useMapRawGeometries(baseComponentId: string): RawGeometry[] | undefined {
  const dataModelBindings = useDataModelBindingsFor(baseComponentId, 'Map');
  const formData = FD.useDebouncedPick(dataModelBindings?.geometries);

  return formData as RawGeometry[] | undefined;
}

export function useMapParsedGeometries(baseComponentId: string): Geometry[] | null {
  const geometryType = useExternalItem(baseComponentId, 'Map').geometryType;
  const rawGeometries = useMapRawGeometries(baseComponentId);

  return useMemo(() => {
    try {
      return parseGeometries(rawGeometries, geometryType);
    } catch {
      throw new Error(
        `Failed to parse geometry data as ${geometryType}:\n- ${rawGeometries?.map((g) => JSON.stringify(g)).join('\n- ')}`,
      );
    }
  }, [geometryType, rawGeometries]);
}

export function useMapGeometryBounds(baseComponentId: string) {
  const geometries = useMapParsedGeometries(baseComponentId);
  return useMemo(() => calculateBounds(geometries), [geometries]);
}

import React from 'react';

import { Paragraph } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Map/MapComponent.module.css';
import { isLocationValid } from 'src/layout/Map/utils';
import type { Location } from 'src/layout/Map/config.generated';

export function MarkerLocationText({ location }: { location: Location | undefined }) {
  return (
    <Paragraph
      data-size='sm'
      className={classes.footer}
    >
      {isLocationValid(location) ? (
        <Lang
          id='map_component.selectedLocation'
          params={[location.latitude, location.longitude]}
        />
      ) : (
        <Lang id='map_component.noSelectedLocation' />
      )}
    </Paragraph>
  );
}

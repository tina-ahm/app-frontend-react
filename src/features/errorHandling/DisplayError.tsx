import React from 'react';

import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';

import { ForbiddenError } from 'src/features/instantiate/containers/ForbiddenError';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { HttpStatusCodes } from 'src/utils/network/networking';

interface Props {
  error: Error | AxiosError;
}

export function DisplayError({ error }: Props) {
  if (isAxiosError(error) && error.response?.status === HttpStatusCodes.Forbidden) {
    return <ForbiddenError />;
  }

  return <UnknownError />;
}

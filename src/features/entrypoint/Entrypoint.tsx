import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import type { AxiosError } from 'axios';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { Form } from 'src/components/form/Form';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import { InstanceSelection } from 'src/features/instantiate/containers/InstanceSelection';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { MissingRolesError } from 'src/features/instantiate/containers/MissingRolesError';
import { NoValidPartiesError } from 'src/features/instantiate/containers/NoValidPartiesError';
import { QueueActions } from 'src/features/queue/queueSlice';
import { ValidationActions } from 'src/features/validation/validationSlice';
import { useActiveInstancesQuery } from 'src/hooks/useActiveInstancesQuery';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { usePartyValidation } from 'src/hooks/usePartyValidation';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { PresentationType, ProcessTaskType } from 'src/types';
import { isStatelessApp } from 'src/utils/appMetadata';
import { checkIfAxiosError, HttpStatusCodes } from 'src/utils/network/networking';
import type { IApplicationMetadata, ShowTypes } from 'src/features/applicationMetadata';

type EntrypointProps = {
  allowAnonymous: boolean;
  applicationMetadata: IApplicationMetadata;
};
export function Entrypoint({ allowAnonymous, applicationMetadata }: EntrypointProps) {
  const [action, setAction] = React.useState<ShowTypes | null>(null);

  const selectedParty = useAppSelector((state) => state.party.selectedParty);

  const {
    data: partyValidation,
    mutate: getPartyValidation,
    isError: errorWhileMutatePartyValidation,
  } = usePartyValidation();

  const { data: activeInstances, isError: errorWhileFetchingActiveInstances } = useActiveInstancesQuery(
    selectedParty?.partyId as string,
    {
      enabled: !!selectedParty?.partyId && partyValidation?.data.valid && action === 'select-instance',
    },
  );

  const statelessLoading = useAppSelector((state) => state.isLoading.stateless);
  const formDataError = useAppSelector((state) => state.formData.error);
  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
  const dispatch = useAppDispatch();

  const componentHasErrors = errorWhileFetchingActiveInstances || errorWhileMutatePartyValidation;
  const componentIsReady = partyValidation && activeInstances;

  useEffect((): void => {
    if (!selectedParty) {
      return;
    }

    getPartyValidation(selectedParty.partyId);
  }, [getPartyValidation, selectedParty]);

  useEffect((): void => {
    // If user comes back to entrypoint from an active instance we need to clear validation messages
    dispatch(ValidationActions.updateValidations({ validations: {} }));
  }, [dispatch]);

  useEffect((): void => {
    if (applicationMetadata) {
      const onEntry = applicationMetadata.onEntry;
      setAction(!onEntry || onEntry.show === 'new-instance' ? 'new-instance' : onEntry.show);
    }
  }, [applicationMetadata]);

  const handleNewInstance = (): void => {
    setAction('new-instance');
  };

  // TODO handle this error
  if (componentHasErrors) {
    return <h1>Could not fetch any instances</h1>;
  }

  if (componentIsReady) {
    if (partyValidation.data.valid === false) {
      if (partyValidation.data.validParties.length === 0) {
        return <NoValidPartiesError />;
      }
      return <Navigate to={`/partyselection/${HttpStatusCodes.Forbidden}`} />;
    }

    // error trying to fetch data, if missing rights we display relevant page
    if (checkIfAxiosError(formDataError)) {
      const axiosError = formDataError as AxiosError;
      if (axiosError.response?.status === HttpStatusCodes.Forbidden) {
        return <MissingRolesError />;
      }
    }

    // regular view with instance
    if (action === 'new-instance' && partyValidation.data.valid) {
      return <InstantiateContainer />;
    }

    if (action === 'select-instance' && partyValidation.data.valid && activeInstances !== null) {
      if (activeInstances.length === 0) {
        // no existing instances exist, we start instantiation
        return <InstantiateContainer />;
      }
      return (
        // let user decide if continuing on existing or starting new
        <PresentationComponent
          header={appName || ''}
          appOwner={appOwner}
          type={ProcessTaskType.Unknown}
        >
          <InstanceSelection
            instances={activeInstances}
            onNewInstance={handleNewInstance}
          />
        </PresentationComponent>
      );
    }

    if (isStatelessApp(applicationMetadata) && (allowAnonymous || partyValidation.data.valid)) {
      if (statelessLoading === null) {
        dispatch(QueueActions.startInitialStatelessQueue());
      }
      if (statelessLoading === false) {
        return (
          <StatelessView
            appName={appName || ''}
            appOwner={appOwner || ''}
          />
        );
      }
    }
  }

  return <GhostLoading />;
}

const StatelessView = ({ appName, appOwner }: { appName: string; appOwner: string }): JSX.Element => (
  <PresentationComponent
    header={appName || ''}
    appOwner={appOwner}
    type={PresentationType.Stateless}
  >
    <div>
      <Form />
    </div>
  </PresentationComponent>
);

const GhostLoading = (): JSX.Element => (
  <PresentationComponent
    header=''
    type={ProcessTaskType.Unknown}
  >
    <AltinnContentLoader
      width='100%'
      height='400'
    >
      <AltinnContentIconFormData />
    </AltinnContentLoader>
  </PresentationComponent>
);

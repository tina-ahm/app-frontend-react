import React from 'react';
import { useSearchParams } from 'react-router-dom';

import cn from 'classnames';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { Form } from 'src/components/form/Form';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { Confirm } from 'src/features/confirm/containers/Confirm';
import { Feedback } from 'src/features/feedback/Feedback';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { PDFView } from 'src/features/pdf/PDFView';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';
import { useApiErrorCheck } from 'src/hooks/useApiErrorCheck';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { useInstanceQuery } from 'src/hooks/useInstanceQuery';
import { useProcessedLayoutQuery } from 'src/hooks/useLayoutQuery';
import { useProcess } from 'src/hooks/useProcess';
import { ProcessTaskType } from 'src/types';
import { getLayoutSetIdForApplication } from 'src/utils/appMetadata';
import { behavesLikeDataTask } from 'src/utils/formLayout';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';

export const ProcessWrapper = () => {
  const instantiating = useAppSelector((state) => state.instantiation.instantiating);
  const instance = useAppSelector((state) => state.instanceData.instance);
  const instanceId = useAppSelector((state) => state.instantiation.instanceId);
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);

  const isLoading = useAppSelector((state) => state.isLoading.dataTask);
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const layoutSetId = getLayoutSetIdForApplication(
    applicationMetadata || ({} as IApplicationMetadata),
    instance,
    layoutSets,
  );

  const { isError: isLayoutQueryError } = useProcessedLayoutQuery({
    applicationMetadataId: applicationMetadata?.id,
    layoutSetId,
    instanceId,
  });

  const { hasApiErrors } = useApiErrorCheck();
  const { process, appOwner, appName } = useProcess();

  const instanceIdFromUrl = useInstanceIdParams()?.instanceId;

  // TODO should error handle this?
  const { data: _ } = useInstanceQuery(instanceIdFromUrl || '', {
    enabled: !instanceId && !instantiating,
  });

  const [searchParams] = useSearchParams();
  const renderPDF = searchParams.get('pdf') === '1';
  const previewPDF = searchParams.get('pdf') === 'preview';

  if (hasApiErrors || isLayoutQueryError) {
    return <UnknownError />;
  }

  // TODO Should render feedback to the user instead of blank page.
  if (!process?.currentTask) {
    return null;
  }
  const { altinnTaskType, elementId } = process.currentTask;

  if (renderPDF) {
    return (
      <PDFView
        appName={appName as string}
        appOwner={appOwner}
      />
    );
  }

  return (
    <>
      <div
        className={cn(classes['content'], {
          [classes['hide-form']]: previewPDF,
        })}
      >
        <PresentationComponent
          header={appName}
          appOwner={appOwner}
          type={altinnTaskType as ProcessTaskType}
        >
          {isLoading === false ? (
            <>
              {altinnTaskType === ProcessTaskType.Data && <Form />}
              {altinnTaskType === ProcessTaskType.Archived && <ReceiptContainer />}
              {altinnTaskType === ProcessTaskType.Confirm &&
                (behavesLikeDataTask(elementId, layoutSets) ? <Form /> : <Confirm />)}
              {altinnTaskType === ProcessTaskType.Feedback && <Feedback />}
            </>
          ) : (
            <GhostLoading />
          )}
        </PresentationComponent>
      </div>
      {previewPDF && (
        <div className={cn(classes['content'], classes['hide-pdf'])}>
          <PDFView
            appName={appName as string}
            appOwner={appOwner}
          />
        </div>
      )}
    </>
  );
};

const GhostLoading = (): JSX.Element => (
  <div style={{ marginTop: '1.5625rem' }}>
    <AltinnContentLoader
      width='100%'
      height={700}
    >
      <AltinnContentIconFormData />
    </AltinnContentLoader>
  </div>
);

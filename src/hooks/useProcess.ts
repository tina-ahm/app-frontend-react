import { useEffect } from 'react';

import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import { ProcessActions } from 'src/features/process/processSlice';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useApplicationMetadata } from 'src/hooks/useApplicationMetadata';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { ProcessTaskType } from 'src/types';
import { behavesLikeDataTask } from 'src/utils/formLayout';

export function useProcess() {
  const dispatch = useAppDispatch();

  const instanceData = useAppSelector((state) => state.instanceData.instance);
  const { data: applicationMetadata } = useApplicationMetadata();
  const process = useAppSelector((state) => state.process);
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);

  const taskType = process?.taskType;
  const taskId = process?.taskId;

  useEffect((): void => {
    if (!applicationMetadata || !instanceData) {
      return;
    }

    if (!taskType) {
      dispatch(ProcessActions.get());
      return;
    }

    if (taskType === ProcessTaskType.Data || behavesLikeDataTask(taskId, layoutSets)) {
      dispatch(QueueActions.startInitialDataTaskQueue());
      return;
    }

    if ([ProcessTaskType.Confirm, ProcessTaskType.Feedback].includes(taskType)) {
      dispatch(QueueActions.startInitialInfoTaskQueue());
    }

    if ([ProcessTaskType.Archived].includes(taskType)) {
      dispatch(IsLoadingActions.finishDataTaskIsLoading());
    }
  }, [taskType, taskId, applicationMetadata, instanceData, dispatch, layoutSets]);

  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
  return { dispatch, process, appOwner, appName };
}

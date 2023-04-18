import { watcherFinishDataTaskIsloadingSaga } from 'src/features/isLoading/dataTaskIsLoadingSagas';
import { watcherFinishStatelessIsLoadingSaga } from 'src/features/isLoading/statelessIsLoadingSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export interface IIsLoadingState {
  dataTask: boolean | null;
  stateless: boolean | null;
}

export const initialState: IIsLoadingState = {
  dataTask: false,
  stateless: null,
};

export let IsLoadingActions: ActionsFromSlice<typeof isLoadingSlice>;
export const isLoadingSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IIsLoadingState>) => ({
    name: 'isLoading',
    initialState,
    actions: {
      startDataTaskIsLoading: mkAction<void>({
        reducer: (state) => {
          state.dataTask = false;
        },
      }),
      finishDataTaskIsLoading: mkAction<void>({
        saga: () => watcherFinishDataTaskIsloadingSaga,
        reducer: (state) => {
          state.dataTask = false;
        },
      }),
      startStatelessIsLoading: mkAction<void>({
        reducer: (state) => {
          state.stateless = false;
        },
      }),
      finishStatelessIsLoading: mkAction<void>({
        saga: () => watcherFinishStatelessIsLoadingSaga,
        reducer: (state) => {
          state.stateless = false;
        },
      }),
    },
  }));
  IsLoadingActions = slice.actions;
  return slice;
};

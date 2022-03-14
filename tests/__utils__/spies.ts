import { AnswersHeadless, State, StateSelector, useAnswersState } from '@yext/answers-headless-react';

export function spyOnActions(): jest.Mocked<AnswersHeadless> {
  const spy = jest.spyOn(require('@yext/answers-headless-react'), 'useAnswersActions');
  const proxyHandler = {
    get: (_, prop) => spy.mock.results[0].value[prop]
  };
  return new Proxy(spy, proxyHandler);
}

export function spyOnAnswersState(
  customState: Partial<State>
): jest.SpyInstance<typeof useAnswersState, unknown[]> {
  function mockImpl<T>(stateAccessor: StateSelector<T>) {
    return stateAccessor({
      ...customState
    } as State);
  }

  return jest
    .spyOn(require('@yext/answers-headless-react'), 'useAnswersState')
    .mockImplementation(mockImpl as (...args: unknown[]) => unknown);
}
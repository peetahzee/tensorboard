/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/
import {
  buildAppRoutingState,
  buildStateFromAppRoutingState,
} from '../../app_routing/store/testing';
import {RouteKind} from '../../app_routing/types';
import {
  buildSessionGroup,
  buildStateFromHparamsState,
  buildHparamsState,
} from '../../hparams/testing';
import {buildMockState} from '../../testing/utils';
import {DataLoadState} from '../../types/data';
import {SortDirection} from '../../types/ui';
import {ColumnHeaderType, SortingOrder} from '../../widgets/data_table/types';
import {GroupByKey, SortType} from '../types';
import * as selectors from './runs_selectors';
import {buildRun, buildRunsState, buildStateFromRunsState} from './testing';

describe('runs_selectors', () => {
  describe('#getRunIdToExperimentId', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunIdToExperimentId.release();
    });

    it('returns runIdToExpId', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runIdToExpId: {
              run1: 'eid1',
              run2: 'eid1',
              run3: 'eid2',
            },
          })
        ),
      });
      expect(selectors.getRunIdToExperimentId(state)).toEqual({
        run1: 'eid1',
        run2: 'eid1',
        run3: 'eid2',
      });
    });
  });
  describe('#getExperimentIdForRunId', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getExperimentIdForRunId.release();
    });

    it('returns eid', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runIdToExpId: {
              run1: 'eid1',
              run2: 'eid1',
              run3: 'eid2',
            },
          })
        ),
      });
      expect(
        selectors.getExperimentIdForRunId(state, {
          runId: 'run1',
        })
      ).toBe('eid1');
      expect(
        selectors.getExperimentIdForRunId(state, {
          runId: 'run2',
        })
      ).toBe('eid1');
      expect(
        selectors.getExperimentIdForRunId(state, {
          runId: 'run3',
        })
      ).toBe('eid2');
    });

    it('returns `null` if the runId is unknown', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runIdToExpId: {run1: 'eid1'},
          })
        ),
      });
      expect(
        selectors.getExperimentIdForRunId(state, {
          runId: 'run4',
        })
      ).toBe(null);
    });
  });

  describe('#getRun', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRun.release();
    });

    it('returns run', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runMetadata: {
              run1: buildRun({id: 'run1'}),
            },
          })
        ),
      });

      expect(selectors.getRun(state, {runId: 'run1'})).toEqual(
        buildRun({
          id: 'run1',
        })
      );
    });

    it('returns `null` if run with `runId` does not exist', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runMetadata: {
              run1: buildRun({id: 'run1'}),
            },
          })
        ),
      });

      expect(selectors.getRun(state, {runId: 'run10'})).toBe(null);
    });
  });

  describe('#getRuns', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRuns.release();
    });

    it('returns runs', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runIds: {
              eid: ['run1'],
            },
            runMetadata: {
              run1: buildRun({id: 'run1'}),
            },
          })
        ),
      });
      expect(selectors.getRuns(state, {experimentId: 'eid'})).toEqual([
        buildRun({
          id: 'run1',
        }),
      ]);
    });

    it('returns runs for the ones that has metadata', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runIds: {
              eid: ['run1', 'run2'],
            },
            runMetadata: {
              run1: buildRun({id: 'run1'}),
            },
          })
        ),
      });
      expect(selectors.getRuns(state, {experimentId: 'eid'})).toEqual([
        buildRun({
          id: 'run1',
        }),
      ]);
    });

    it('returns empty list if experiment id does not exist', () => {
      const state = buildMockState();
      expect(
        selectors.getRuns(state, {
          experimentId: 'i_do_not_exist',
        })
      ).toEqual([]);
    });
  });

  describe('#getDashboardRuns', () => {
    it('returns runs', () => {
      const state = buildMockState({
        ...buildStateFromAppRoutingState(
          buildAppRoutingState({
            activeRoute: {
              routeKind: RouteKind.EXPERIMENT,
              params: {experimentId: 'eid'},
            },
          })
        ),
        ...buildStateFromRunsState(
          buildRunsState({
            runIds: {
              eid: ['run1'],
            },
            runMetadata: {
              run1: buildRun({id: 'run1'}),
            },
          })
        ),
      });
      expect(selectors.getDashboardRuns(state)).toEqual([
        {
          ...buildRun({
            id: 'run1',
          }),
          experimentId: 'eid',
        },
      ]);
    });

    it('returns runs that have metadata', () => {
      const state = buildMockState({
        ...buildStateFromAppRoutingState(
          buildAppRoutingState({
            activeRoute: {
              routeKind: RouteKind.EXPERIMENT,
              params: {experimentId: 'eid'},
            },
          })
        ),
        ...buildStateFromRunsState(
          buildRunsState({
            runIds: {
              eid: ['run1', 'run2'],
            },
            runMetadata: {
              run1: buildRun({id: 'run1'}),
            },
          })
        ),
      });
      expect(selectors.getDashboardRuns(state)).toEqual([
        {
          ...buildRun({
            id: 'run1',
          }),
          experimentId: 'eid',
        },
      ]);
    });

    it('returns empty list if experiment id does not exist', () => {
      const state = buildMockState(
        buildStateFromAppRoutingState(
          buildAppRoutingState({
            activeRoute: {
              routeKind: RouteKind.EXPERIMENTS,
              params: {},
            },
          })
        )
      );
      expect(selectors.getDashboardRuns(state)).toEqual([]);
    });

    it('includes dashboard hparams data', () => {
      const state = buildMockState({
        ...buildStateFromAppRoutingState(
          buildAppRoutingState({
            activeRoute: {
              routeKind: RouteKind.EXPERIMENT,
              params: {experimentId: 'eid'},
            },
          })
        ),
        ...buildStateFromRunsState(
          buildRunsState({
            runIds: {
              eid: ['run1', 'run2'],
            },
            runMetadata: {
              run1: buildRun({id: 'run1'}),
            },
          })
        ),
        ...buildStateFromHparamsState(
          buildHparamsState({
            dashboardSessionGroups: [
              buildSessionGroup({
                name: 'some_session_group',
                hparams: {hp1: 'foo', hp2: 'bar'},
                sessions: [
                  {
                    name: 'run1',
                    metricValues: [],
                  } as any,
                ],
              }),
            ],
          })
        ),
      });
      expect(selectors.getDashboardRuns(state)).toEqual([
        {
          ...buildRun({
            id: 'run1',
            hparams: [
              {name: 'hp1', value: 'foo'},
              {name: 'hp2', value: 'bar'},
            ],
            metrics: [],
          }),
          experimentId: 'eid',
        },
      ]);
    });

    it('never returns hparams or metric data from run metadata', () => {
      const state = buildMockState({
        ...buildStateFromAppRoutingState(
          buildAppRoutingState({
            activeRoute: {
              routeKind: RouteKind.EXPERIMENT,
              params: {experimentId: 'eid'},
            },
          })
        ),
        ...buildStateFromRunsState(
          buildRunsState({
            runIds: {
              eid: ['run1', 'run2'],
            },
            runMetadata: {
              run1: buildRun({
                id: 'run1',
                hparams: [{name: 'foo', value: '1'}],
                metrics: [{tag: 'm1', value: 4}],
              }),
            },
          })
        ),
      });

      const response = selectors.getDashboardRuns(state)[0];
      expect(response.hparams).toBeNull();
      expect(response.metrics).toBeNull();
    });
  });

  describe('#getRunIdsForExperiment', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunIdsForExperiment.release();
    });

    it('returns runIds', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runIds: {
              eid: ['run1', 'run2'],
            },
          })
        ),
      });
      expect(
        selectors.getRunIdsForExperiment(state, {experimentId: 'eid'})
      ).toEqual(['run1', 'run2']);
    });

    it('returns empty list if experiment id does not exist', () => {
      const state = buildMockState();
      expect(
        selectors.getRunIdsForExperiment(state, {
          experimentId: 'i_do_not_exist',
        })
      ).toEqual([]);
    });
  });

  describe('#getRunMap', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunMap.release();
    });

    it('returns a map from RunId to Run', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runMetadata: {
              run1: buildRun({id: 'run1'}),
              run2: buildRun({id: 'run2'}),
            },
          })
        ),
      });

      expect(selectors.getRunMap(state)).toEqual(
        new Map([
          ['run1', buildRun({id: 'run1'})],
          ['run2', buildRun({id: 'run2'})],
        ])
      );
    });

    it('returns an empty map if there are no runs', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runMetadata: {},
          })
        ),
      });

      expect(selectors.getRunMap(state)).toEqual(new Map());
    });
  });

  describe('#getRunsLoadState', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunsLoadState.release();
    });

    it('returns loadState', () => {
      const loadState = {
        state: DataLoadState.FAILED,
        lastLoadedTimeInMs: 1337,
      };

      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({runsLoadState: {id1: loadState}})
        ),
      });
      expect(
        selectors.getRunsLoadState(state, {
          experimentId: 'id1',
        })
      ).toEqual(loadState);
    });

    it('returns NOT_LOADED state if experiment id does not exist', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            runsLoadState: {
              id1: {state: DataLoadState.FAILED, lastLoadedTimeInMs: 1337},
            },
          })
        ),
      });
      expect(selectors.getRunsLoadState(state, {experimentId: 'id2'})).toEqual({
        lastLoadedTimeInMs: null,
        state: DataLoadState.NOT_LOADED,
      });
    });
  });

  describe('#getRunSelectionMap', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunSelectionMap.release();
    });

    it('returns selection map of runId passed', () => {
      const state = buildMockState({
        runs: buildRunsState(
          {},
          {
            selectionState: new Map([
              ['r1', false],
              ['r2', true],
            ]),
          }
        ),
      });

      const actual = selectors.getRunSelectionMap(state);
      expect(actual).toEqual(
        new Map([
          ['r1', false],
          ['r2', true],
        ])
      );
    });
  });

  describe('#getRunSelectorPaginationOption', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunSelectorPaginationOption.release();
    });

    it('returns pagination option', () => {
      const state = buildStateFromRunsState(
        buildRunsState(undefined, {
          paginationOption: {
            pageIndex: 1,
            pageSize: 20,
          },
        })
      );

      expect(selectors.getRunSelectorPaginationOption(state)).toEqual({
        pageIndex: 1,
        pageSize: 20,
      });
    });
  });

  describe('#getRunSelectorRegexFilter', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunSelectorRegexFilter.release();
    });

    it('returns regex filter', () => {
      const state = buildStateFromRunsState(
        buildRunsState({regexFilter: 'meow'}, undefined)
      );

      expect(selectors.getRunSelectorRegexFilter(state)).toBe('meow');
    });
  });

  describe('#getRunSelectorSort', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunSelectorSort.release();
    });

    it('returns sort options', () => {
      const state = buildStateFromRunsState(
        buildRunsState(undefined, {
          sort: {
            key: {type: SortType.RUN_NAME},
            direction: SortDirection.UNSET,
          },
        })
      );

      expect(selectors.getRunSelectorSort(state)).toEqual({
        key: {type: SortType.RUN_NAME},
        direction: SortDirection.UNSET,
      });
    });
  });

  describe('#getRunColorOverride', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunColorOverride.release();
    });

    it('returns override map', () => {
      const state = buildStateFromRunsState(
        buildRunsState({
          runColorOverrideForGroupBy: new Map([
            ['foo', '#aaa'],
            ['bar', '#bbb'],
          ]),
        })
      );

      expect(selectors.getRunColorOverride(state)).toEqual(
        new Map([
          ['foo', '#aaa'],
          ['bar', '#bbb'],
        ])
      );
    });
  });

  describe('#getDefaultRunColorIdMap', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getDefaultRunColorIdMap.release();
    });

    it('returns override map', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            defaultRunColorIdForGroupBy: new Map([
              ['foo', 1],
              ['bar', 2],
            ]),
          })
        ),
      });

      expect(selectors.getDefaultRunColorIdMap(state)).toEqual(
        new Map([
          ['foo', 1],
          ['bar', 2],
        ])
      );
    });
  });

  describe('#getRunUserSetGroupBy', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunUserSetGroupBy.release();
    });

    it('returns groupBy set by user when it is present', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            colorGroupRegexString: 'hello',
            initialGroupBy: {key: GroupByKey.RUN},
            userSetGroupByKey: GroupByKey.REGEX,
          })
        ),
      });

      expect(selectors.getRunUserSetGroupBy(state)).toEqual({
        key: GroupByKey.REGEX,
        regexString: 'hello',
      });
    });

    it('returns null if user never has set one', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            initialGroupBy: {key: GroupByKey.RUN},
            userSetGroupByKey: null,
          })
        ),
      });

      expect(selectors.getRunUserSetGroupBy(state)).toEqual(null);
    });
  });

  describe('#getRunGroupBy', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getRunUserSetGroupBy.release();
      selectors.getRunGroupBy.release();
    });

    it('returns groupBy set by user when it is present', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            colorGroupRegexString: 'hello',
            initialGroupBy: {key: GroupByKey.RUN},
            userSetGroupByKey: GroupByKey.REGEX,
          })
        ),
      });

      expect(selectors.getRunGroupBy(state)).toEqual({
        key: GroupByKey.REGEX,
        regexString: 'hello',
      });
    });

    it('returns groupBy set by user with regexString overridden', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            colorGroupRegexString: '',
            initialGroupBy: {key: GroupByKey.REGEX, regexString: 'hello'},
            userSetGroupByKey: GroupByKey.REGEX,
          })
        ),
      });

      expect(selectors.getRunGroupBy(state)).toEqual({
        key: GroupByKey.REGEX,
        regexString: '',
      });
    });

    it('returns initial group by if user never has set one', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            initialGroupBy: {key: GroupByKey.RUN},
            userSetGroupByKey: null,
          })
        ),
      });

      expect(selectors.getRunGroupBy(state)).toEqual({
        key: GroupByKey.RUN,
      });
    });
  });

  describe('#getColorGroupRegexString', () => {
    beforeEach(() => {
      // Clear the memoization.
      selectors.getColorGroupRegexString.release();
    });

    it('returns regex string when it is group by regex', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            colorGroupRegexString: 'foo(\\d+)',
          })
        ),
      });

      expect(selectors.getColorGroupRegexString(state)).toEqual('foo(\\d+)');
    });

    it('returns default empty string if user never has set one', () => {
      const state = buildMockState();

      expect(selectors.getColorGroupRegexString(state)).toEqual('');
    });

    it('returns regex string even if it is not user set groupby', () => {
      const state = buildMockState({
        ...buildStateFromRunsState(
          buildRunsState({
            colorGroupRegexString: 'foo(\\d+)',
          })
        ),
      });

      expect(selectors.getColorGroupRegexString(state)).toEqual('foo(\\d+)');
    });
  });

  describe('#getRunsTableHeaders', () => {
    it('returns the runs table headers', () => {
      const state = buildMockState({
        runs: buildRunsState(
          {},
          {
            runsTableHeaders: [
              {
                type: ColumnHeaderType.RUN,
                name: 'run',
                displayName: 'Run',
                enabled: true,
              },
              {
                type: ColumnHeaderType.COLOR,
                name: 'color',
                displayName: 'Color',
                enabled: false,
              },
            ],
          }
        ),
      });
      expect(selectors.getRunsTableHeaders(state)).toEqual([
        {
          type: ColumnHeaderType.RUN,
          name: 'run',
          displayName: 'Run',
          enabled: true,
        },
        {
          type: ColumnHeaderType.COLOR,
          name: 'color',
          displayName: 'Color',
          enabled: false,
        },
      ]);
    });
  });

  describe('#getRunsTableSortingInfo', () => {
    it('returns the runs data table sorting info', () => {
      const state = buildMockState({
        runs: buildRunsState(
          {},
          {
            sortingInfo: {
              name: 'run',
              order: SortingOrder.ASCENDING,
            },
          }
        ),
      });
      expect(selectors.getRunsTableSortingInfo(state)).toEqual({
        name: 'run',
        order: SortingOrder.ASCENDING,
      });
    });
  });
});

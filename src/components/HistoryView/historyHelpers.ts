import { resolveArchivedTagName } from '../../board/completedWork';
import type {
  ArchivedCardTagSnapshot,
  BoardTag,
  CompletedWorkCycle,
} from '../../types';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const formatHistoryDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
};

export const sortCompletedWorkCycles = (cycles: CompletedWorkCycle[]) =>
  cycles.toSorted(
    (first, second) => Date.parse(second.endDate) - Date.parse(first.endDate)
  );

export const sortHistoryCycles = <
  Cycle extends { endDate: string; id: string },
>(
  cycles: Cycle[]
) =>
  cycles.toSorted((first, second) => {
    const dateDifference =
      Date.parse(second.endDate) - Date.parse(first.endDate);

    return dateDifference === 0
      ? second.id.localeCompare(first.id)
      : dateDifference;
  });

export const getVisibleTagNames = (
  card: {
    tagIds: string[];
    tagSnapshots: ArchivedCardTagSnapshot[];
  },
  tags: BoardTag[]
) =>
  card.tagIds
    .map((tagId) => resolveArchivedTagName(tagId, card, tags))
    .filter((tagName): tagName is string => Boolean(tagName));

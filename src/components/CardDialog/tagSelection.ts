import type { BoardTag } from '../../types';

export const toggleSelectedTagId = (selectedTagIds: string[], tagId: string) =>
  selectedTagIds.includes(tagId)
    ? selectedTagIds.filter((selectedTagId) => selectedTagId !== tagId)
    : [...selectedTagIds, tagId];

export const getSelectedTagNames = (
  tags: BoardTag[],
  selectedTagIds: string[]
) => {
  const tagNameById = new Map(tags.map((tag) => [tag.id, tag.name]));

  return selectedTagIds
    .map((tagId) => tagNameById.get(tagId))
    .filter((tagName): tagName is string => Boolean(tagName));
};

export const getTagSummary = (
  tags: BoardTag[],
  selectedTagIds: string[],
  fallback: string
) => {
  const selectedTagNames = getSelectedTagNames(tags, selectedTagIds);

  return selectedTagNames.length > 0 ? selectedTagNames.join(', ') : fallback;
};

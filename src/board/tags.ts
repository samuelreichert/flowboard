import type { BoardColumn, BoardTag } from './types.js';

export const TAG_NAME_REQUIRED_MESSAGE = 'Enter a tag name.';
export const TAG_NAME_DUPLICATE_MESSAGE = 'Tag names must be unique.';

export const normalizeTagName = (name: string) => name.trim();

export const hasDuplicateTagName = (
  tags: BoardTag[],
  name: string,
  ignoredTagId?: string
) =>
  tags.some(
    (tag) =>
      tag.id !== ignoredTagId && tag.name.toLowerCase() === name.toLowerCase()
  );

export const getTagNameError = (
  tags: BoardTag[],
  rawName: string,
  ignoredTagId?: string
) => {
  const name = normalizeTagName(rawName);

  if (!name) {
    return TAG_NAME_REQUIRED_MESSAGE;
  }

  if (hasDuplicateTagName(tags, name, ignoredTagId)) {
    return TAG_NAME_DUPLICATE_MESSAGE;
  }

  return '';
};

export const createTag = (tags: BoardTag[], rawName: string, id: string) => {
  const tag = { id, name: normalizeTagName(rawName) };

  return {
    tag,
    tags: [...tags, tag],
  };
};

export const renameTag = (
  tags: BoardTag[],
  tagId: string,
  rawName: string
): BoardTag[] =>
  tags.map((tag) =>
    tag.id === tagId ? { ...tag, name: normalizeTagName(rawName) } : tag
  );

export const deleteTag = (tags: BoardTag[], tagId: string): BoardTag[] =>
  tags.filter((tag) => tag.id !== tagId);

export const removeTagFromColumns = (
  columns: BoardColumn[],
  tagId: string
): BoardColumn[] =>
  columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => ({
      ...card,
      tagIds: card.tagIds.filter((cardTagId) => cardTagId !== tagId),
    })),
  }));

export const countTagUsage = (columns: BoardColumn[], tagId: string) =>
  columns.reduce(
    (count, column) =>
      count + column.cards.filter((card) => card.tagIds.includes(tagId)).length,
    0
  );

import type { ReactNode } from 'react';

export type HeadingValue = 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4';
export type ListValue = 'none' | 'bullet' | 'ordered' | 'task';
export type AlignValue = 'left' | 'center' | 'right' | 'justify';

export type ToolbarSelectOption<TValue extends string> = {
  icon?: ReactNode;
  label: string;
  triggerLabel?: string;
  value: TValue;
};

export type EditorToolbarState = {
  alignValue: AlignValue;
  canRedo: boolean;
  canUndo: boolean;
  headingValue: HeadingValue;
  imageSrc: string;
  isBlockquote: boolean;
  isBold: boolean;
  isCode: boolean;
  isCodeBlock: boolean;
  isImage: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrike: boolean;
  linkHref: string;
  listValue: ListValue;
};

## 1. Theme Token Cleanup

- [x] 1.1 Consolidate theme token declarations so root light tokens and dark-theme overrides are the authoritative source.
- [x] 1.2 Convert theme and status color values to OKLCH where practical while preserving semantic token names used by components.
- [x] 1.3 Reduce duplicated surface variables and repeated white values without merging roles that may need to diverge later.
- [x] 1.4 Replace remaining hardcoded editor popup, select, tooltip, URL field, and control colors with theme tokens.
- [x] 1.5 Update priority color tokens so low is green, medium is yellow, and high is red in both light and dark themes.

## 2. Control Typography And Editor Selection

- [x] 2.1 Normalize ordinary input, textarea, select trigger, tag entry, and editor URL field typography to the same font family and weight.
- [x] 2.2 Preserve the editable card title's display-style sizing and weight as an intentional exception.
- [x] 2.3 Add a non-layout-shifting selected-image outline or focus treatment for Tiptap image node selection.
- [x] 2.4 Verify the selected-image outline appears only while the image is selected and does not interfere with contextual image actions.

## 3. README And Screenshot History

- [x] 3.1 Preserve the existing screenshot as a historical UI asset with a clear first-version or legacy filename.
- [x] 3.2 Add or identify screenshot assets for the second version and latest UI using clear filenames.
- [x] 3.3 Update the README to show the latest UI screenshot first and list or label historical screenshots separately.
- [x] 3.4 Revise README feature, storage, and offline language so board background customization is not advertised as a current primary feature.

## 4. Verification

- [x] 4.1 Run the test suite or targeted UI tests for card metadata, rich editor, and README-relevant behavior.
- [x] 4.2 Run the production build to verify CSS, assets, and TypeScript compile successfully.
- [x] 4.3 Manually inspect light and dark themes, priority chips, editor popovers, selected image state, ordinary form controls, and README screenshot rendering.

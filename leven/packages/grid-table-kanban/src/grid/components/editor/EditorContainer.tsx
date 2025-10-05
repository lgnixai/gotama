/* eslint-disable jsx-a11y/no-static-element-interactions */
import { getRandomString } from '../../../utils/string';
import { clamp } from 'lodash';
import type { CSSProperties, ForwardRefRenderFunction } from 'react';
import { useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import type { IGridTheme } from '../../configs';
import { useKeyboardSelection } from '../../hooks';
import type { IInteractionLayerProps } from '../../InteractionLayer';
import {
  SelectionRegionType,
  type IActiveCellBound,
  type ICellItem,
  type IRectangle,
  type IScrollState,
} from '../../interface';
import type { CombinedSelection } from '../../managers';
import type { ICell, IInnerCell } from '../../renderers/cell-renderer/interface';
import { CellType } from '../../renderers/cell-renderer/interface';
import { isPrintableKey } from '../../utils';
import { BooleanEditor } from './BooleanEditor';
import { RatingEditor } from './RatingEditor';
import { SelectEditor } from './SelectEditor';
import { TextEditor } from './TextEditor';
import { UserEditor } from './UserEditor';
import { ImageEditor } from './ImageEditor';
import { DateEditor } from './DateEditor';

export interface IEditorContainerProps
  extends Pick<
    IInteractionLayerProps,
    | 'theme'
    | 'coordInstance'
    | 'scrollToItem'
    | 'real2RowIndex'
    | 'getCellContent'
    | 'onUndo'
    | 'onRedo'
    | 'onCopy'
    | 'onPaste'
    | 'onDelete'
    | 'onRowAppend'
    | 'onRowExpand'
    | 'scrollBy'
  > {
  isEditing?: boolean;
  scrollState: IScrollState;
  activeCell: ICellItem | null;
  selection: CombinedSelection;
  activeCellBound: IActiveCellBound | null;
  setActiveCell: React.Dispatch<React.SetStateAction<ICellItem | null>>;
  setSelection: React.Dispatch<React.SetStateAction<CombinedSelection>>;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onChange?: (cell: ICellItem, cellValue: IInnerCell) => void;
}

export interface IEditorRef<T extends IInnerCell = IInnerCell> {
  focus?: () => void;
  setValue?: (data: T['data']) => void;
  saveValue?: () => void;
}

export interface IEditorProps<T extends IInnerCell = IInnerCell> {
  cell: T;
  rect: IRectangle & { editorId: string };
  theme: IGridTheme;
  style?: CSSProperties;
  isEditing?: boolean;
  setEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  onChange?: (value: unknown) => void;
}

export interface IEditorContainerRef {
  focus?: () => void;
  saveValue?: () => void;
}

const NO_EDITING_CELL_TYPES = new Set([CellType.Boolean, CellType.Rating]);

export const EditorContainerBase: ForwardRefRenderFunction<
  IEditorContainerRef,
  IEditorContainerProps
> = (props, ref) => {
  const {
    theme,
    isEditing,
    coordInstance,
    scrollState,
    activeCell,
    selection,
    activeCellBound,
    scrollToItem,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onChange,
    onDelete,
    onRowExpand,
    setEditing,
    setActiveCell,
    setSelection,
    real2RowIndex,
    getCellContent,
    scrollBy,
  } = props;
  const { scrollLeft, scrollTop } = scrollState;
  const { rowIndex, realRowIndex, columnIndex } = useMemo(() => {
    const [columnIndex, realRowIndex] = activeCell ?? [-1, -1];
    return {
      rowIndex: real2RowIndex(realRowIndex) ?? -1,
      realRowIndex,
      columnIndex,
    };
  }, [activeCell, real2RowIndex]);
  const cellContent = useMemo(() => {
    return getCellContent([columnIndex, realRowIndex]) as IInnerCell;
  }, [columnIndex, realRowIndex, getCellContent]);
  const { type: cellType, readonly, editorWidth } = cellContent;
  const editingEnable = !readonly && isEditing && activeCell;
  const width = editorWidth ?? coordInstance.getColumnWidth(columnIndex);
  const height = activeCellBound?.height ?? coordInstance.getRowHeight(rowIndex);
  const editorRef = useRef<IEditorRef | null>(null);
  const defaultFocusRef = useRef<HTMLInputElement | null>(null);
  const editorId = useMemo(() => `editor-container-${getRandomString(8)}`, []);

  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus?.(),
    saveValue: () => editorRef.current?.saveValue?.(),
  }));

  useEffect(() => {
    if ((cellContent as ICell).type === CellType.Loading) return;
    if (!activeCell || isEditing) return;
    editorRef.current?.setValue?.(cellContent.data);
  }, [cellContent, activeCell, isEditing]);

  useEffect(() => {
    if ((cellType as CellType) === CellType.Loading) return;
    if (!activeCell || selection.type === SelectionRegionType.None) return;
    requestAnimationFrame(() => (editorRef.current || defaultFocusRef.current)?.focus?.());
  }, [cellType, activeCell, selection, isEditing]);

  useKeyboardSelection({
    editorRef,
    isEditing,
    activeCell,
    selection,
    coordInstance,
    onUndo,
    onRedo,
    onDelete,
    onRowExpand,
    setEditing,
    setActiveCell,
    setSelection,
    scrollToItem,
    scrollBy,
  });

  const editorStyle = useMemo(
    () =>
      (editingEnable
        ? { pointerEvents: 'auto', minWidth: width, minHeight: height }
        : { pointerEvents: 'none', opacity: 0, width: 0, height: 0, display: 'none' }) as React.CSSProperties,
    [editingEnable, height, width]
  );

  // 移除未使用的rect memo
  // const rect = useMemo(() => { ... });

  // 直接计算位置，避免memo缓存问题
  const editorTop = clamp(
    coordInstance.getRowOffset(rowIndex) - scrollTop,
    coordInstance.rowInitSize,
    coordInstance.containerHeight - height
  );
  const editorLeft = clamp(
    coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft),
    coordInstance.columnInitSize,
    coordInstance.containerWidth - width
  );

  // 创建当前的rect对象
  const currentRect = {
    x: editorLeft,
    y: editorTop,
    width,
    height,
    editorId,
  };

  console.log('🎯 最终应用的位置:', { top: editorTop, left: editorLeft, rowIndex, columnIndex });

  const EditorRenderer = useMemo(() => {
    if (readonly) return null;

    const onChangeInner = (value: unknown) => {
      onChange?.([columnIndex, realRowIndex], {
        ...cellContent,
        data: value,
      } as IInnerCell);
    };

    const { customEditor } = cellContent;

    if (customEditor) {
      return customEditor(
        {
          rect: currentRect,
          theme,
          style: editorStyle,
          cell: cellContent as IInnerCell,
          isEditing,
          setEditing,
          onChange: onChangeInner,
        },
        editorRef
      );
    }

    switch (cellType) {
      case CellType.Text:
      case CellType.Link:
      case CellType.Number: {
        return (
          <TextEditor
            ref={editorRef}
            rect={currentRect}
            theme={theme}
            style={editorStyle}
            cell={cellContent}
            isEditing={isEditing}
            onChange={onChangeInner}
          />
        );
      }
      case CellType.Boolean:
        return (
          <BooleanEditor
            ref={editorRef}
            rect={currentRect}
            theme={theme}
            cell={cellContent}
            onChange={onChangeInner}
          />
        );
      case CellType.Rating:
        return (
          <RatingEditor
            ref={editorRef}
            rect={currentRect}
            theme={theme}
            cell={cellContent}
            onChange={onChangeInner}
          />
        );
      case CellType.Select:
        return (
          <SelectEditor
            ref={editorRef}
            rect={currentRect}
            theme={theme}
            cell={cellContent}
            style={editorStyle}
            isEditing={isEditing}
            setEditing={setEditing}
            onChange={onChangeInner}
          />
        );
      case CellType.Image:
        return (
          <ImageEditor
            ref={editorRef}
            rect={currentRect}
            theme={theme}
            cell={cellContent}
            style={editorStyle}
            isEditing={isEditing}
            onChange={onChangeInner}
          />
        );
      case CellType.Text: // 复用 Text 的壳，但外层映射为日期字段
        if ((cellContent as any).isDateLike) {
          return (
            <DateEditor
              ref={editorRef}
              rect={currentRect}
              theme={theme}
              cell={cellContent as any}
              style={editorStyle}
              isEditing={isEditing}
              onChange={onChangeInner}
            />
          );
        }
      case CellType.User:
        return (
          <UserEditor
            ref={editorRef}
            rect={currentRect}
            theme={theme}
            cell={cellContent as any}
            style={editorStyle}
            isEditing={isEditing}
            onChange={onChangeInner}
          />
        );
      default:
        return null;
    }
  }, [
    currentRect,
    theme,
    readonly,
    cellType,
    cellContent,
    columnIndex,
    realRowIndex,
    editorStyle,
    isEditing,
    onChange,
    setEditing,
  ]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!activeCell || isEditing) return;
    if (!isPrintableKey(event.nativeEvent)) return;
    if (NO_EDITING_CELL_TYPES.has(cellType)) return;
    requestAnimationFrame(() => setEditing(true));
    editorRef.current?.setValue?.(null);
  };

  const onPasteInner = (e: React.ClipboardEvent) => {
    if (!activeCell || isEditing) return;
    onPaste?.(selection, e);
  };

  const onCopyInner = (e: React.ClipboardEvent) => {
    if (!activeCell || isEditing) return;
    onCopy?.(selection, e);
  };

  // 最终位置 - 直接内联计算，确保使用最新值
  const finalTop = clamp(
    coordInstance.getRowOffset(rowIndex) - scrollTop,
    coordInstance.rowInitSize,
    coordInstance.containerHeight - height
  );
  const finalLeft = clamp(
    coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft),
    coordInstance.columnInitSize,
    coordInstance.containerWidth - width
  );

  console.log('📍 FINAL位置 (render时):', { 
    finalTop, 
    finalLeft, 
    rowIndex, 
    columnIndex,
    activeCell,
    isEditing,
    editingEnable
  });

  const canRenderPositionedEditor = Boolean(
    isEditing && activeCell && rowIndex >= 0 && columnIndex >= 0
  );

  return (
    <div
      id={editorId}
      className="click-outside-ignore pointer-events-none w-full"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
      }}
      key={`editor-${columnIndex}-${realRowIndex}-${isEditing}`}
    >
      {canRenderPositionedEditor && (
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: finalTop,
          left: finalLeft,
          minWidth: width,
          minHeight: height,
        }}
        onKeyDown={onKeyDown}
        onPaste={onPasteInner}
        onCopy={onCopyInner}
      >
        {EditorRenderer}
        <input 
          className="opacity-0" 
          ref={defaultFocusRef} 
          style={{ 
            position: 'absolute',
            pointerEvents: 'none',
            width: 0,
            height: 0,
            border: 'none',
            padding: 0,
            margin: 0,
            overflow: 'hidden'
          }} 
        />
      </div>
      )}
    </div>
  );
};

export const EditorContainer = forwardRef(EditorContainerBase);

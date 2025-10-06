import { useRef, useState, useImperativeHandle } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef } from 'react';
import type { IGridColumn } from '../../interface';
import type { IFieldType } from '../field-type-selector/FieldTypeSelector';
import { FieldTypeSelector, type IFieldTypeSelectorRef } from '../field-type-selector/FieldTypeSelector';
import { ColumnContextMenu, type IColumnContextMenuRef } from '../column-context-menu/ColumnContextMenu';
import { FieldPropertyEditor, type IFieldPropertyEditorRef } from '../field-property-editor/FieldPropertyEditor';

export interface IColumnManagementRef {
  showFieldTypeSelector: (position: { x: number; y: number }) => void;
  showColumnContextMenu: (position: { x: number; y: number }, columnIndex: number) => void;
  showFieldPropertyEditor: (column: IGridColumn, columnIndex: number) => void;
  hideAll: () => void;
}

export interface IColumnManagementProps {
  columns: IGridColumn[];
  onColumnsChange?: (columns: IGridColumn[]) => void;
  onAddColumn?: (fieldType: IFieldType, insertIndex?: number) => void;
  onEditColumn?: (columnIndex: number, updatedColumn: IGridColumn) => void;
  onDuplicateColumn?: (columnIndex: number) => void;
  onDeleteColumn?: (columnIndex: number) => void;
  onInsertColumnLeft?: (columnIndex: number, fieldType: IFieldType) => void;
  onInsertColumnRight?: (columnIndex: number, fieldType: IFieldType) => void;
}

const ColumnManagementBase: ForwardRefRenderFunction<
  IColumnManagementRef,
  IColumnManagementProps
> = (props, ref) => {
  const {
    columns,
    onColumnsChange,
    onAddColumn,
    onEditColumn,
    onDuplicateColumn,
    onDeleteColumn,
    onInsertColumnLeft,
    onInsertColumnRight,
  } = props;

  const fieldTypeSelectorRef = useRef<IFieldTypeSelectorRef>(null);
  const columnContextMenuRef = useRef<IColumnContextMenuRef>(null);
  const fieldPropertyEditorRef = useRef<IFieldPropertyEditorRef>(null);

  const [pendingColumnIndex, setPendingColumnIndex] = useState<number>(-1);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    showFieldTypeSelector: (position: { x: number; y: number }) => {
      setPendingColumnIndex(-1); // 添加到末尾
      fieldTypeSelectorRef.current?.show(position);
    },
    showColumnContextMenu: (position: { x: number; y: number }, columnIndex: number) => {
      columnContextMenuRef.current?.show(position, columnIndex);
    },
    showFieldPropertyEditor: (column: IGridColumn, columnIndex: number) => {
      fieldPropertyEditorRef.current?.show(column, columnIndex);
    },
    hideAll: () => {
      fieldTypeSelectorRef.current?.hide();
      columnContextMenuRef.current?.hide();
      fieldPropertyEditorRef.current?.hide();
    },
  }));

  // 字段类型选择器事件处理
  const handleFieldTypeSelect = (fieldType: IFieldType) => {
    if (pendingColumnIndex >= 0) {
      // 在指定位置插入
      onInsertColumnLeft?.(pendingColumnIndex, fieldType);
      onInsertColumnRight?.(pendingColumnIndex, fieldType);
    } else {
      // 添加到末尾
      onAddColumn?.(fieldType);
    }
    setPendingColumnIndex(-1);
  };

  const handleFieldTypeCancel = () => {
    setPendingColumnIndex(-1);
  };

  // 列右键菜单事件处理
  const handleEditField = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (column) {
      fieldPropertyEditorRef.current?.show(column, columnIndex);
    }
  };

  const handleDuplicateField = (columnIndex: number) => {
    onDuplicateColumn?.(columnIndex);
  };

  const handleInsertFieldLeft = (columnIndex: number) => {
    setPendingColumnIndex(columnIndex);
    // 这里需要获取鼠标位置，暂时使用默认位置
    fieldTypeSelectorRef.current?.show({ x: 100, y: 100 });
  };

  const handleInsertFieldRight = (columnIndex: number) => {
    setPendingColumnIndex(columnIndex + 1);
    // 这里需要获取鼠标位置，暂时使用默认位置
    fieldTypeSelectorRef.current?.show({ x: 100, y: 100 });
  };

  const handleFilterByField = (columnIndex: number) => {
    console.log('Filter by field:', columnIndex);
    // TODO: 实现筛选功能
  };

  const handleSortByField = (columnIndex: number) => {
    console.log('Sort by field:', columnIndex);
    // TODO: 实现排序功能
  };

  const handleGroupByField = (columnIndex: number) => {
    console.log('Group by field:', columnIndex);
    // TODO: 实现分组功能
  };

  const handleFreezeToField = (columnIndex: number) => {
    console.log('Freeze to field:', columnIndex);
    // TODO: 实现冻结功能
  };

  const handleHideField = (columnIndex: number) => {
    console.log('Hide field:', columnIndex);
    // TODO: 实现隐藏字段功能
  };

  const handleDeleteField = (columnIndex: number) => {
    onDeleteColumn?.(columnIndex);
  };

  // 字段属性编辑器事件处理
  const handleFieldPropertySave = (columnIndex: number, updatedColumn: IGridColumn) => {
    onEditColumn?.(columnIndex, updatedColumn);
  };

  const handleFieldPropertyCancel = () => {
    // 取消编辑
  };

  return (
    <>
      <FieldTypeSelector
        ref={fieldTypeSelectorRef}
        onSelect={handleFieldTypeSelect}
        onCancel={handleFieldTypeCancel}
      />
      
      <ColumnContextMenu
        ref={columnContextMenuRef}
        onEditField={handleEditField}
        onDuplicateField={handleDuplicateField}
        onInsertFieldLeft={handleInsertFieldLeft}
        onInsertFieldRight={handleInsertFieldRight}
        onFilterByField={handleFilterByField}
        onSortByField={handleSortByField}
        onGroupByField={handleGroupByField}
        onFreezeToField={handleFreezeToField}
        onHideField={handleHideField}
        onDeleteField={handleDeleteField}
      />
      
      <FieldPropertyEditor
        ref={fieldPropertyEditorRef}
        onSave={handleFieldPropertySave}
        onCancel={handleFieldPropertyCancel}
      />
    </>
  );
};

export const ColumnManagement = forwardRef(ColumnManagementBase);

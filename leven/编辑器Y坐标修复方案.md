# 编辑器Y坐标和多编辑框问题修复方案

## 📷 问题描述

从截图观察到：
1. 点击User 6（第7行）
2. 但编辑器显示在User 3-4的位置（Y坐标偏上约120px）
3. 有3个编辑框同时显示（应该只有1个）
4. 编辑框显示的值是正确的：`mailto:user6@example.com`

## 🔍 问题分析

### 问题1：Y坐标偏移

**期望位置**：
- User 6在第7行（rowIndex=6）
- Y = 列头高度(40) + 6行 × 行高(40) = 280px

**实际位置**：
- 显示在约160px的位置
- 偏差：280 - 160 = 120px（正好3行）

**可能原因**：
1. `rowIndex`计算错误（6变成了3）
2. `coordInstance.getRowOffset(rowIndex)`返回值不对
3. 容器的padding/margin影响了计算

### 问题2：多个编辑框显示

**不正常现象**：
- 应该只有1个EditorContainer实例
- 但截图显示有3个可见的编辑框

**可能原因**：
1. React渲染问题导致旧的DOM没有被清理
2. EditorContainer的key不对导致复用问题
3. CSS的opacity/display没有正确隐藏旧的编辑框

## ✅ 解决方案

### 修复1：添加调试日志检查rowIndex

在EditorContainer中添加console.log来确认rowIndex的值：

```tsx
const rect = useMemo(() => {
  const { rowInitSize, columnInitSize, containerWidth, containerHeight } = coordInstance;
  
  console.log('编辑器位置计算:', {
    rowIndex,
    realRowIndex,
    columnIndex,
    rowInitSize,
    rowOffset: coordInstance.getRowOffset(rowIndex),
    scrollTop
  });
  
  const x = clamp(
    coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft),
    columnInitSize,
    containerWidth - width
  );
  const y = clamp(
    coordInstance.getRowOffset(rowIndex) - scrollTop,
    rowInitSize,
    containerHeight - height
  );

  console.log('计算得到的位置:', { x, y });

  return { x, y, width, height, editorId };
}, [coordInstance, rowIndex, columnIndex, width, height, scrollLeft, scrollTop, editorId]);
```

### 修复2：确保只显示一个编辑器

检查`editorStyle`是否正确应用。可能需要在不编辑时强制隐藏：

```tsx
const editorStyle = useMemo(
  () =>
    (editingEnable
      ? { pointerEvents: 'auto', minWidth: width, minHeight: height }
      : { pointerEvents: 'none', opacity: 0, width: 0, height: 0, display: 'none' }) as React.CSSProperties,  // 添加display: 'none'
  [editingEnable, height, width]
);
```

### 修复3：检查SimpleDemo中的rowCount

从截图看，行数变多了（User 0-13），可能是点击了"增加行数"按钮。确保：
- rowCount的值正确
- coordInstance使用了正确的rowCount

## 🎯 立即应用的修复

让我先添加调试日志，看看实际的rowIndex值是多少：



# Grid Table Kanban - Demo 功能说明

## 🎯 示例概览

本 Demo 展示了 Grid Table Kanban 组件的所有核心功能，包括两个版本：

### 📝 简单示例 (Simple Demo)
基础功能演示，适合快速了解组件的基本用法。

### 🎯 完整功能示例 (Full Featured Demo)
完整的功能演示，展示所有高级特性和实际应用场景。

---

## ✨ 功能清单

### 1. 📊 数据展示

#### 支持的单元格类型
- ✅ **文本 (Text)** - 普通文本显示
- ✅ **链接 (Link)** - 可点击的超链接
- ✅ **选择 (Select)** - 单选/多选标签
- ✅ **评分 (Rating)** - 星级评分
- ✅ **数字 (Number)** - 数字和百分比
- ✅ **用户 (User)** - 用户头像和名称
- ✅ **布尔值 (Boolean)** - 复选框
- ✅ **按钮 (Button)** - 可点击的按钮
- ✅ **图表 (Chart)** - 进度条等图表

### 2. ✏️ 编辑功能

#### 单元格编辑
- ✅ **双击编辑** - 双击单元格进入编辑模式
- ✅ **Enter 编辑** - 选中单元格后按 Enter
- ✅ **实时保存** - 编辑后自动保存
- ✅ **类型验证** - 根据单元格类型验证输入

#### 支持的编辑器
- ✅ **文本编辑器** - 支持多行文本
- ✅ **选择编辑器** - 下拉选择
- ✅ **评分编辑器** - 点击星星评分
- ✅ **布尔编辑器** - 复选框切换

### 3. 📋 列操作

#### 列管理
- ✅ **添加列** - 动态添加新列
- ✅ **删除列** - 选中列后删除
- ✅ **重命名列** - 双击列头编辑名称

#### 列调整
- ✅ **列宽调整 (Resize)** - 拖动列边界调整宽度
- ✅ **列排序** - 拖动列头重新排列列
- ✅ **列冻结** - 冻结左侧列，滚动时保持可见

#### 列配置
- ✅ **主列标记** - 设置主要列（通常是第一列）
- ✅ **列菜单** - 点击列头菜单进行操作
- ✅ **列描述** - 鼠标悬停显示列描述

### 4. 📝 行操作

#### 行管理
- ✅ **添加行** - 在末尾或指定位置添加新行
- ✅ **删除行** - 选中行后删除
- ✅ **行排序** - 拖动行重新排列

#### 行控件
- ✅ **复选框** - 选择多行
- ✅ **拖动手柄** - 拖动排序
- ✅ **展开按钮** - 展开/折叠分组

### 5. 🎯 选择功能

#### 选择模式
- ✅ **单元格选择** - 选中单个或多个单元格
- ✅ **行选择** - 选中整行
- ✅ **列选择** - 选中整列
- ✅ **区域选择** - 拖动选择矩形区域

#### 多选操作
- ✅ **Shift 多选** - 按住 Shift 连续选择
- ✅ **Ctrl/Cmd 多选** - 按住 Ctrl 或 Cmd 添加选区
- ✅ **全选** - Ctrl+A 全选

### 6. 📋 剪贴板操作

- ✅ **复制 (Ctrl+C)** - 复制选中的单元格
- ✅ **粘贴 (Ctrl+V)** - 粘贴数据到选中区域
- ✅ **剪切 (Ctrl+X)** - 剪切选中的单元格
- ✅ **删除 (Delete)** - 删除选中的内容

### 7. ↩️ 历史记录

- ✅ **撤销 (Ctrl+Z)** - 撤销上一步操作
- ✅ **重做 (Ctrl+Y)** - 重做被撤销的操作
- ✅ **历史栈** - 保留最近 50 次操作记录

### 8. 🔍 搜索功能

- ✅ **全局搜索** - 搜索所有单元格内容
- ✅ **高亮显示** - 高亮显示搜索结果
- ✅ **搜索导航** - 跳转到上一个/下一个结果
- ✅ **当前位置** - 显示当前结果的位置

### 9. 📁 分组功能

#### 分组管理
- ✅ **按列分组** - 按指定列的值分组
- ✅ **多级分组** - 支持多层级分组
- ✅ **折叠/展开** - 点击分组头展开或折叠

#### 分组显示
- ✅ **分组头** - 显示分组名称和统计
- ✅ **分组统计** - 显示每组的记录数
- ✅ **分组颜色** - 不同层级使用不同背景色

### 10. 📊 统计功能

- ✅ **列统计** - 显示每列的统计信息
- ✅ **平均值** - 计算数字列的平均值
- ✅ **总和** - 计算数字列的总和
- ✅ **计数** - 统计非空单元格数量
- ✅ **自定义统计** - 支持自定义统计公式

### 11. 🚀 性能优化

#### 虚拟化
- ✅ **虚拟滚动** - 仅渲染可见区域的单元格
- ✅ **懒加载** - 按需加载数据
- ✅ **性能监控** - 监控渲染性能

#### 优化策略
- ✅ **Canvas 渲染** - 使用 Canvas 高性能渲染
- ✅ **增量更新** - 仅更新变化的单元格
- ✅ **智能缓存** - 缓存渲染结果

### 12. 👥 协作功能

- ✅ **协作光标** - 显示其他用户的编辑位置
- ✅ **用户颜色** - 每个用户使用不同颜色标识
- ✅ **实时更新** - 实时同步其他用户的修改

### 13. ⌨️ 键盘导航

#### 方向键导航
- ✅ **上下左右** - 在单元格间移动
- ✅ **Tab** - 移动到下一个单元格
- ✅ **Shift+Tab** - 移动到上一个单元格
- ✅ **Home/End** - 跳转到行首/行尾
- ✅ **Page Up/Down** - 翻页

#### 快捷键
- ✅ **Enter** - 进入编辑模式
- ✅ **Esc** - 退出编辑/取消选择
- ✅ **Ctrl+C** - 复制
- ✅ **Ctrl+V** - 粘贴
- ✅ **Ctrl+Z** - 撤销
- ✅ **Ctrl+Y** - 重做
- ✅ **Delete** - 删除

### 14. 🎨 主题定制

- ✅ **颜色主题** - 自定义颜色方案
- ✅ **字体设置** - 自定义字体和大小
- ✅ **间距调整** - 调整单元格内边距
- ✅ **边框样式** - 自定义边框颜色和样式

### 15. 📱 触摸设备支持

- ✅ **触摸滚动** - 支持触摸滚动
- ✅ **手势操作** - 支持捏合缩放
- ✅ **长按菜单** - 长按显示上下文菜单
- ✅ **触摸选择** - 触摸选择单元格

---

## 🎮 操作指南

### 基础操作

#### 1. 导航
- **鼠标滚轮**: 垂直滚动
- **Shift + 鼠标滚轮**: 水平滚动
- **方向键**: 在单元格间移动
- **Page Up/Down**: 翻页

#### 2. 选择
- **点击单元格**: 选中单个单元格
- **拖动**: 选择矩形区域
- **Shift + 点击**: 选择区间
- **Ctrl/Cmd + 点击**: 添加/移除选区
- **点击行头**: 选中整行
- **点击列头**: 选中整列

#### 3. 编辑
- **双击单元格**: 进入编辑模式
- **选中后按 Enter**: 进入编辑模式
- **输入内容后按 Enter**: 保存并移动到下一行
- **按 Esc**: 取消编辑

#### 4. 拖放
- **拖动列头**: 重新排列列
- **拖动行头**: 重新排列行
- **拖动列边界**: 调整列宽
- **拖动冻结手柄**: 调整冻结列数

### 高级操作

#### 1. 批量编辑
1. 选中多个单元格
2. 按 Delete 删除内容
3. 或复制其他单元格粘贴到选区

#### 2. 分组操作
1. 点击 "启用分组" 按钮
2. 点击分组头展开/折叠
3. 查看每组的统计信息

#### 3. 搜索
1. 在搜索框输入关键词
2. 按 Enter 开始搜索
3. 点击 "下一个" 浏览结果
4. 搜索结果会高亮显示

#### 4. 列管理
1. 点击 "添加列" 添加新列
2. 拖动列头重新排序
3. 拖动列边界调整宽度
4. 点击列菜单进行更多操作

---

## 💡 最佳实践

### 性能优化建议

1. **大数据集**
   - 使用虚拟滚动处理大量数据
   - 启用懒加载和分页
   - 避免在 getCellContent 中进行复杂计算

2. **编辑操作**
   - 使用防抖优化频繁的编辑操作
   - 批量更新数据而不是逐个更新
   - 保存历史记录时设置合理的栈深度

3. **渲染优化**
   - 使用 memo 避免不必要的重渲染
   - 合理使用分组减少渲染行数
   - 避免过多的自定义渲染器

### 用户体验建议

1. **交互反馈**
   - 提供清晰的加载状态
   - 显示操作成功/失败的提示
   - 使用协作光标显示其他用户的操作

2. **错误处理**
   - 验证用户输入
   - 提供友好的错误提示
   - 支持撤销误操作

3. **可访问性**
   - 支持键盘导航
   - 提供合适的 ARIA 标签
   - 确保颜色对比度

---

## 🔧 技术实现

### 核心技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Canvas API** - 高性能渲染
- **Tailwind CSS** - 样式系统

### 关键特性

1. **虚拟化渲染**
   - 使用 Canvas 渲染可见区域
   - 智能计算可视区域
   - 按需加载和卸载单元格

2. **状态管理**
   - React 状态管理
   - 支持外部状态管理库
   - 历史记录栈

3. **事件处理**
   - 统一的事件系统
   - 支持鼠标和键盘事件
   - 触摸设备支持

---

## 📚 代码示例

### 基础用法

```tsx
import { Grid, CellType } from '@teable/grid-table-kanban'

function MyGrid() {
  const columns = [
    { id: 'name', name: 'Name', width: 200 },
    { id: 'email', name: 'Email', width: 250 },
  ]

  const getCellContent = ([colIndex, rowIndex]) => {
    const columnId = columns[colIndex].id
    if (columnId === 'name') {
      return { type: CellType.Text, data: `User ${rowIndex}` }
    }
    return { type: CellType.Text, data: `user${rowIndex}@example.com` }
  }

  return (
    <Grid
      columns={columns}
      rowCount={1000}
      getCellContent={getCellContent}
    />
  )
}
```

### 完整配置

```tsx
<Grid
  ref={gridRef}
  columns={columns}
  rowCount={rowCount}
  freezeColumnCount={1}
  draggable={DraggableType.All}
  selectable={SelectableType.All}
  rowControls={[
    { type: RowControlType.Checkbox },
    { type: RowControlType.Drag },
  ]}
  groupPoints={groupPoints}
  collapsedGroupIds={collapsedGroupIds}
  columnStatistics={statistics}
  collaborators={collaborators}
  searchCursor={searchCursor}
  searchHitIndex={searchResults}
  getCellContent={getCellContent}
  onCellEdited={handleCellEdited}
  onRowAppend={handleRowAppend}
  onColumnAppend={handleColumnAppend}
  onRowOrdered={handleRowOrdered}
  onColumnOrdered={handleColumnOrdered}
  onColumnResize={handleColumnResize}
  onSelectionChanged={handleSelectionChanged}
  onCopy={handleCopy}
  onPaste={handlePaste}
  onDelete={handleDelete}
  onUndo={handleUndo}
  onRedo={handleRedo}
/>
```

---

## 🎯 使用场景

### 适用场景

- ✅ **数据管理系统** - 大量数据的展示和编辑
- ✅ **项目管理工具** - 任务列表、甘特图
- ✅ **CRM 系统** - 客户信息管理
- ✅ **电子表格应用** - 类 Excel 功能
- ✅ **数据分析平台** - 数据展示和探索
- ✅ **协作工具** - 多人实时协作编辑

### 不适用场景

- ❌ **简单列表** - 使用普通表格即可
- ❌ **静态展示** - 不需要编辑功能
- ❌ **移动优先** - 主要为桌面端优化

---

## 🚀 运行 Demo

### 安装依赖

```bash
cd leven/demo
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 访问地址

打开浏览器访问: `http://localhost:5173`

---

## 📖 文档

- [快速开始](../packages/grid-table-kanban/QUICKSTART.md)
- [API 文档](../packages/grid-table-kanban/README.md)
- [项目树](../packages/grid-table-kanban/PROJECT_TREE.md)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

**享受使用 Grid Table Kanban! 🎉**
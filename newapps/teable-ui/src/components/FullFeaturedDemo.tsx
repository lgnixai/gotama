import { Undo2, Redo2, Plus, SlidersHorizontal, Filter, ArrowUpDown, PanelsTopLeft, Menu, ArrowUpRight } from 'lucide-react'
/**
 * Full Featured Grid Demo - 完整功能演示
 * 
 * 展示功能:
 * - ✅ 添加/删除列
 * - ✅ 列拖拽排序
 * - ✅ 列宽调整 (Resize)
 * - ✅ 列冻结
 * - ✅ 添加/删除行
 * - ✅ 行拖拽排序
 * - ✅ 单元格编辑 (文本、选择、评分、布尔值等)
 * - ✅ 批量选择和修改
 * - ✅ 复制/粘贴/删除
 * - ✅ 撤销/重做
 * - ✅ 搜索和高亮
 * - ✅ 分组和折叠
 * - ✅ 统计行
 * - ✅ 协作光标
 * - ✅ 键盘导航
 */

import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import {
  Grid,
  type IGridRef,
  type IGridColumn,
  type ICell,
  type ICellItem,
  type IInnerCell,
  type CombinedSelection,
  type IColumnStatistics,
  type ICollaborator,
  type IGroupPoint,
  CellType,
  DraggableType,
  SelectableType,
  LinearRowType,
  RowControlType,
  Colors,
} from '@teable/grid-table-kanban'

import teable, { ensureLogin } from '../lib/teable-simple'

// 数据类型定义
interface IRowData {
  id: string
  name: string
  email: string
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  rating: number
  progress: number
  assignees: Array<{ id: string; name: string; avatar?: string }>
  tags: string[]
  done: boolean
  description: string
  createdAt: Date
  dueDate?: Date
}

// 列类型定义
type ColumnId = keyof IRowData | 'actions'

// 生成模拟数据
const generateMockData = (count: number): IRowData[] => {
  const statuses: IRowData['status'][] = ['todo', 'doing', 'done']
  const priorities: IRowData['priority'][] = ['low', 'medium', 'high']
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
  const tags = ['Bug', 'Feature', 'Enhancement', 'Documentation', 'Testing']

  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    name: `Task ${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    rating: (i % 5) + 1,
    progress: (i * 13) % 101,
    assignees: [
      { id: `u${i}-1`, name: names[i % names.length], avatar: undefined },
      { id: `u${i}-2`, name: names[(i + 1) % names.length], avatar: undefined },
    ],
    tags: [tags[i % tags.length], tags[(i + 2) % tags.length]],
    done: i % 3 === 0,
    description: `This is task ${i + 1} description. Lorem ipsum dolor sit amet.`,
    createdAt: new Date(Date.now() - i * 86400000),
    dueDate: i % 2 === 0 ? new Date(Date.now() + (10 - i) * 86400000) : undefined,
  }))
}

const getEffectiveTableId = (tableId: string) => String(tableId)

export default function FullFeaturedDemo(props: { tableId?: string }) {
  const gridRef = useRef<IGridRef | null>(null)

  // 数据状态
  const [data, setData] = useState<IRowData[]>(() => generateMockData(100))
  const [deletedRows, setDeletedRows] = useState<Set<number>>(new Set())

  // UI 配置状态
  const [columns, setColumns] = useState<IGridColumn[]>([
    { id: 'actions', name: '', width: 36, hasMenu: false },
    { id: 'name', name: 'Task Name', width: 200, isPrimary: true, hasMenu: true },
    { id: 'email', name: 'Email', width: 220, hasMenu: true },
    { id: 'status', name: 'Status', width: 120, hasMenu: true },
    { id: 'priority', name: 'Priority', width: 120, hasMenu: true },
    { id: 'rating', name: 'Rating', width: 140, hasMenu: true },
    { id: 'progress', name: 'Progress', width: 100, hasMenu: true },
    { id: 'assignees', name: 'Assignees', width: 200, hasMenu: true },
    { id: 'tags', name: 'Tags', width: 200, hasMenu: true },
    { id: 'done', name: 'Completed', width: 100, hasMenu: true },
  ])

  const [freezeColumnCount, setFreezeColumnCount] = useState(1)
  const [selectable, setSelectable] = useState<SelectableType>(SelectableType.All)
  const [draggable, setDraggable] = useState<DraggableType>(DraggableType.All)
  const [showStatistics, setShowStatistics] = useState(true)
  const [enableGrouping, setEnableGrouping] = useState(false)
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set())
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<ICellItem[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  // 顶部面板开关与条件
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showSortPanel, setShowSortPanel] = useState(false)
  const [showGroupPanel, setShowGroupPanel] = useState(false)
  const [simpleFilter, setSimpleFilter] = useState<{ fieldId?: string; value?: string }>({})
  const [sortCond, setSortCond] = useState<{ fieldId?: string; order?: 'asc' | 'desc' }>({})
  const [groupByFieldId, setGroupByFieldId] = useState<string | undefined>(undefined)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  // 字段 id->name 映射（旧项目后端按字段名作为键）
  const [fieldIdToName, setFieldIdToName] = useState<Record<string, string>>({})

  // 当传入 tableId 时，自动从后端加载字段与数据
  useEffect(() => {
    const load = async () => {
      if (!props.tableId) return
      try {
        await ensureLogin()
        // 加载字段
        const fieldsResp = await teable.listFields({ table_id: String(props.tableId), limit: 200 })
        const loadedColumns: IGridColumn[] = (fieldsResp?.data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          width: 160,
          hasMenu: true,
        }))
        if (loadedColumns.length > 0) setColumns([{ id: 'actions', name: '', width: 36, hasMenu: false }, ...loadedColumns])
        const id2name: Record<string, string> = {}
        ;(fieldsResp?.data || []).forEach((f: any) => (id2name[f.id] = f.name))
        setFieldIdToName(id2name)

        // 加载记录
        const recResp = await teable.listRecords({ table_id: String(props.tableId), limit: 1000 })
        const rows = (recResp?.data || []).map((r: any) => {
          const row: any = { id: r.id }
          const data = r.data || {}
          // 将字段名数据映射到以字段id为列的行对象
          for (const fid in id2name) {
            const fname = id2name[fid]
            row[fid] = data[fname]
          }
          return row as IRowData
        })
        if (Array.isArray(rows) && rows.length > 0) {
          setData(rows)
          setDeletedRows(new Set())
        }
      } catch (e) {
        console.error('加载表字段或记录失败', e)
      }
    }
    load()
  }, [props.tableId])

  // 历史记录 (简单实现)
  const [history, setHistory] = useState<IRowData[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // 选择状态
  const [selection, setSelection] = useState<CombinedSelection | null>(null)

  // 模拟协作者
  const [collaborators] = useState<ICollaborator>([
    {
      activeCellId: ['row-5', 'email'],
      user: { id: 'u1', name: 'Alice Chen', email: 'alice@example.com' },
      borderColor: Colors.Blue,
      timeStamp: Date.now(),
    },
    {
      activeCellId: ['row-15', 'status'],
      user: { id: 'u2', name: 'Bob Smith', email: 'bob@example.com' },
      borderColor: Colors.Green,
      timeStamp: Date.now(),
    },
  ])

  // 获取可见的行数据 (过滤已删除的行)
  const visibleData = useMemo(() => {
    let rows = data.filter((_, index) => !deletedRows.has(index))
    // 简单筛选：字段包含值（大小写不敏感）
    if (simpleFilter.fieldId && (simpleFilter.value ?? '').toString().length > 0) {
      const fid = simpleFilter.fieldId
      const q = (simpleFilter.value ?? '').toString().toLowerCase()
      rows = rows.filter((r: any) => `${r[fid] ?? ''}`.toLowerCase().includes(q))
    }
    // 简单排序
    if (sortCond.fieldId && sortCond.order) {
      const fid = sortCond.fieldId
      const dir = sortCond.order === 'asc' ? 1 : -1
      rows = [...rows].sort((a: any, b: any) => {
        const av = a[fid]
        const bv = b[fid]
        if (av == null && bv == null) return 0
        if (av == null) return -1 * dir
        if (bv == null) return 1 * dir
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
        return String(av).localeCompare(String(bv)) * dir
      })
    }
    return rows
  }, [data, deletedRows, simpleFilter, sortCond])

  // 分组点数据
  const groupPoints = useMemo<IGroupPoint[] | null>(() => {
    const fid = groupByFieldId
    if (!fid) return null
    const points: IGroupPoint[] = []
    const map = visibleData.reduce((acc, row: any) => {
      const key = row[fid] == null ? '未分组' : String(row[fid])
      if (!acc[key]) acc[key] = 0
      acc[key] += 1
      return acc
    }, {} as Record<string, number>)
    Object.entries(map).forEach(([key, count]) => {
      const gid = `group-${key}`
      points.push({ id: gid, type: LinearRowType.Group, depth: 0, value: key, isCollapsed: collapsedGroupIds.has(gid) })
      points.push({ type: LinearRowType.Row, count })
    })
    return points
  }, [groupByFieldId, visibleData, collapsedGroupIds])

  // 统计数据
  const columnStatistics = useMemo<IColumnStatistics | undefined>(() => {
    if (!showStatistics) return undefined

    const stats: IColumnStatistics = {}
    
    columns.forEach((col) => {
      const columnId = col.id as ColumnId
      if (columnId === 'rating') {
        const avgRating = visibleData.reduce((sum, row) => sum + row.rating, 0) / visibleData.length
        stats[col.id!] = {
          total: `Avg: ${avgRating.toFixed(1)} ⭐`,
        }
      } else if (columnId === 'progress') {
        const avgProgress = visibleData.reduce((sum, row) => sum + row.progress, 0) / visibleData.length
        stats[col.id!] = {
          total: `${avgProgress.toFixed(0)}%`,
        }
      } else if (columnId === 'done') {
        const doneCount = visibleData.filter(row => row.done).length
        stats[col.id!] = {
          total: `${doneCount}/${visibleData.length}`,
        }
      }
    })

    return stats
  }, [showStatistics, columns, visibleData])

  // 获取单元格内容
  const getCellContent = useCallback((cell: ICellItem): ICell => {
    const [colIndex, rowIndex] = cell
    const column = columns[colIndex]
    const columnId = column?.id as ColumnId
    const row = visibleData[rowIndex]

    if (!row || !columnId) {
      return { type: CellType.Text, data: '', displayData: '' }
    }

    switch (columnId) {
      case 'actions':
        return { type: CellType.Text, data: '↗', displayData: '↗' }
      case 'name':
        return {
          type: CellType.Text,
          data: row.name,
          displayData: row.name,
        }

      case 'email':
        return {
          type: CellType.Link,
          data: [`mailto:${row.email}`],
          displayData: row.email,
        }

      case 'status':
        return {
          type: CellType.Select,
          data: [{ title: row.status.toUpperCase(), id: row.status }],
          displayData: [row.status.toUpperCase()],
          isMultiple: false,
        }

      case 'priority': {
        const colorMap = {
          low: Colors.Green,
          medium: Colors.Orange,
          high: Colors.Red,
        }
        return {
          type: CellType.Select,
          data: [{ title: row.priority.toUpperCase(), id: row.priority, color: colorMap[row.priority] }],
          displayData: [row.priority.toUpperCase()],
          isMultiple: false,
        }
      }

      case 'rating':
        return {
          type: CellType.Rating,
          data: row.rating,
          icon: 'star',
          color: Colors.Amber,
          max: 5,
        }

      case 'progress':
        return {
          type: CellType.Number,
          data: row.progress,
          displayData: `${row.progress}%`,
        }

      case 'assignees':
        return {
          type: CellType.User,
          data: row.assignees,
        }

      case 'tags':
        return {
          type: CellType.Select,
          data: row.tags.map((tag, i) => ({
            title: tag,
            id: `${tag}-${i}`,
            color: Colors.Blue,
          })),
          displayData: row.tags,
          isMultiple: true,
        }

      case 'done':
        return {
          type: CellType.Boolean,
          data: row.done,
        }

      case 'description':
        return {
          type: CellType.Text,
          data: row.description,
          displayData: row.description,
        }

      default: {
        // 动态字段：直接回显文本值
        const anyRow = row as any
        const value = anyRow[columnId]
        return { type: CellType.Text, data: value ?? '', displayData: String(value ?? '') }
      }
    }
  }, [columns, visibleData])

  // 保存历史记录
  const saveHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push([...data])
      return newHistory.slice(-50) // 保留最近50次
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [data, historyIndex])

  // 单元格编辑
  const handleCellEdited = useCallback(async (cell: ICellItem, newValue: IInnerCell) => {
    const [colIndex, rowIndex] = cell
    const columnId = columns[colIndex]?.id as ColumnId
    
    saveHistory()
    
    setData(prevData => {
      const newData = [...prevData]
      const row = { ...newData[rowIndex] }
      
      switch (columnId) {
        case 'name':
          row.name = String(newValue)
          break
        case 'status':
          if (typeof newValue === 'string') {
            row.status = newValue as IRowData['status']
          }
          break
        case 'priority':
          if (typeof newValue === 'string') {
            row.priority = newValue as IRowData['priority']
          }
          break
        case 'rating':
          row.rating = Number(newValue) || 0
          break
        case 'done':
          row.done = Boolean(newValue)
          break
        case 'progress':
          row.progress = Math.max(0, Math.min(100, Number(newValue) || 0))
          break
        default: {
          // 动态字段：本地即时更新，提升交互一致性
          const value = (typeof newValue === 'object' && newValue !== null && 'data' in (newValue as any))
            ? (newValue as any).data
            : newValue
          ;(row as any)[columnId] = value
          break
        }
      }
      
      newData[rowIndex] = row
      return newData
    })

    try {
      await ensureLogin()
      // 如果该行尚未有后端 ID，则先创建
      let recordId = visibleData[rowIndex]?.id
      if (!recordId || String(recordId).startsWith('row-')) {
        const baseFields: Record<string, any> = {
          name: visibleData[rowIndex]?.name ?? '',
          email: visibleData[rowIndex]?.email ?? '',
          status: visibleData[rowIndex]?.status ?? 'todo',
          priority: visibleData[rowIndex]?.priority ?? 'medium',
          rating: visibleData[rowIndex]?.rating ?? 0,
          progress: visibleData[rowIndex]?.progress ?? 0,
          done: visibleData[rowIndex]?.done ?? false,
          description: visibleData[rowIndex]?.description ?? '',
        }
        const created = await teable.createRecord({ table_id: getEffectiveTableId(props.tableId || 'demo'), fields: baseFields })
        recordId = created.data.id
        setData(prev => {
          const cp = [...prev]
          const r = { ...cp[rowIndex], id: recordId as string }
          cp[rowIndex] = r as any
          return cp
        })
      }

      // 根据列更新对应字段（后端按字段名作为键）
      const updateFields: Record<string, any> = {}
      const fieldName = fieldIdToName[columnId] || columnId
      switch (columnId) {
        case 'name':
          updateFields[fieldName] = String(newValue)
          break
        case 'status':
          if (typeof newValue === 'string') updateFields[fieldName] = newValue
          break
        case 'priority':
          if (typeof newValue === 'string') updateFields[fieldName] = newValue
          break
        case 'rating':
          updateFields[fieldName] = Number(newValue) || 0
          break
        case 'done':
          updateFields[fieldName] = Boolean(newValue)
          break
        case 'progress':
          updateFields[fieldName] = Math.max(0, Math.min(100, Number(newValue) || 0))
          break
      }

      const tableId = getEffectiveTableId(props.tableId || 'demo')
      if (Object.keys(updateFields).length > 0 && recordId) {
        await teable.updateRecord({ table_id: tableId, record_id: String(recordId), fields: updateFields })
      } else if (recordId && columnId && !(fieldName in updateFields)) {
        // 动态字段更新：尽量从对象结构中取 data，否则转为字符串
        const value = (typeof newValue === 'object' && newValue !== null && 'data' in (newValue as any))
          ? (newValue as any).data
          : newValue
        await teable.updateRecord({ table_id: tableId, record_id: String(recordId), fields: { [fieldName]: value as any } })
      }
    } catch (e) {
      console.error('保存编辑到后端失败', e)
    }
  }, [columns, saveHistory, visibleData, props.tableId, fieldIdToName])

  // 添加新行
  const handleRowAppend = useCallback(async (targetIndex?: number) => {
    saveHistory()
    const newRow: IRowData = {
      id: `row-${Date.now()}`,
      name: `New Task ${data.length + 1}`,
      email: `new${data.length + 1}@example.com`,
      status: 'todo',
      priority: 'medium',
      rating: 3,
      progress: 0,
      assignees: [],
      tags: [],
      done: false,
      description: 'New task description',
      createdAt: new Date(),
    }

    setData(prev => {
      const newData = [...prev]
      if (targetIndex !== undefined) {
        newData.splice(targetIndex + 1, 0, newRow)
      } else {
        newData.push(newRow)
      }
      return newData
    })

    try {
      await ensureLogin()
      // 自动授予当前用户对该表的编辑权限（若已有权限，后端会忽略）
      try {
        const profile = await teable.getProfile()
        if (profile?.id && props?.tableId) {
          await teable.grantTableEditPermission({ user_id: profile.id, table_id: String(props.tableId) })
        }
      } catch {}
      const created = await teable.createRecord({
        table_id: getEffectiveTableId(props.tableId || 'demo'),
        fields: {
          name: newRow.name,
          email: newRow.email,
          status: newRow.status,
          priority: newRow.priority,
          rating: newRow.rating,
          progress: newRow.progress,
          done: newRow.done,
          description: newRow.description,
        },
      })
      const backendId = created.data.id
      setData(prev => {
        const cp = [...prev]
        const insertAt = targetIndex !== undefined ? targetIndex + 1 : cp.length - 1
        cp[insertAt] = { ...cp[insertAt], id: backendId }
        return cp
      })
    } catch (e) {
      console.error('创建记录失败', e)
    }
  }, [data, saveHistory, props.tableId])

  // 添加新列
  const handleColumnAppend = useCallback(() => {
    const newCol: IGridColumn = {
      id: `custom-${columns.length}`,
      name: `Custom ${columns.length + 1}`,
      width: 150,
      hasMenu: true,
    }
    setColumns(prev => [...prev, newCol])
  }, [columns])

  // 列调整大小
  const handleColumnResize = useCallback((column: IGridColumn, newSize: number, colIndex: number) => {
    setColumns(prev => prev.map((c, i) => i === colIndex ? { ...c, width: newSize } : c))
  }, [])

  // 列管理功能回调
  const handleAddColumn = useCallback(async (fieldType: any, insertIndex?: number) => {
    const localColumn: IGridColumn = {
      id: `col-${Date.now()}`,
      name: fieldType.name,
      width: 160,
      description: fieldType.description,
      icon: fieldType.icon,
    }

    // 先本地插入，提升响应速度
    if (insertIndex !== undefined) {
      setColumns((cols) => {
        const newCols = [...cols]
        newCols.splice(insertIndex, 0, localColumn)
        return newCols
      })
    } else {
      setColumns((cols) => [...cols, localColumn])
    }

    // 同步到后端新建字段
    try {
      await ensureLogin()
      const created = await teable.createField({
        table_id: getEffectiveTableId(props.tableId || 'demo'),
        name: fieldType.name,
        type: 'singleLineText',
      })
      const field = created.data
      setColumns((cols) => cols.map((c) => (c === localColumn ? { ...c, id: field.id, name: field.name } : c)))
    } catch (e) {
      console.error('创建字段失败', e)
    }
  }, [props.tableId])

  const handleEditColumn = useCallback((columnIndex: number, updatedColumn: IGridColumn) => {
    setColumns((cols) => cols.map((col, index) => 
      index === columnIndex ? { ...col, ...updatedColumn } : col
    ))
  }, [])

  const handleDuplicateColumn = useCallback((columnIndex: number) => {
    const columnToDuplicate = columns[columnIndex]
    if (columnToDuplicate) {
      const duplicatedColumn = {
        ...columnToDuplicate,
        id: `col-${Date.now()}`,
        name: `${columnToDuplicate.name} (副本)`,
      }
      setColumns((cols) => {
        const newCols = [...cols]
        newCols.splice(columnIndex + 1, 0, duplicatedColumn)
        return newCols
      })
    }
  }, [columns])

  const handleDeleteColumn = useCallback((columnIndex: number) => {
    setColumns((cols) => cols.filter((_, index) => index !== columnIndex))
  }, [])

  // 列排序
  const handleColumnOrdered = useCallback((dragCols: number[], dropCol: number) => {
    setColumns(prev => {
      const newCols = [...prev]
      const draggedCols = dragCols.map(i => newCols[i])
      
      // 移除被拖拽的列
      for (let i = dragCols.length - 1; i >= 0; i--) {
        newCols.splice(dragCols[i], 1)
      }
      
      // 插入到新位置
      newCols.splice(dropCol, 0, ...draggedCols)
      return newCols
    })
  }, [])

  // 行排序
  const handleRowOrdered = useCallback((dragRows: number[], dropRow: number) => {
    saveHistory()
    setData(prev => {
      const newData = [...prev]
      const draggedRows = dragRows.map(i => newData[i])
      
      // 移除被拖拽的行
      for (let i = dragRows.length - 1; i >= 0; i--) {
        newData.splice(dragRows[i], 1)
      }
      
      // 插入到新位置
      newData.splice(dropRow, 0, ...draggedRows)
      return newData
    })
  }, [saveHistory])

  // 删除选中的行/列
  const handleDelete = useCallback((selection: CombinedSelection) => {
    saveHistory()
    
    if (selection.type === 'rows') {
      const rowsToDelete = new Set(selection.ranges.flatMap(range => {
        const [start, end] = range as [number, number]
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      }))
      setDeletedRows(prev => new Set([...prev, ...rowsToDelete]))
    } else if (selection.type === 'columns') {
      const colsToDelete = new Set(selection.ranges.flatMap(range => {
        const [start, end] = range as [number, number]
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      }))
      setColumns(prev => prev.filter((_, i) => !colsToDelete.has(i)))
    }
  }, [saveHistory])

  // 复制
  const handleCopy = useCallback((selection: CombinedSelection, e: React.ClipboardEvent) => {
    if (selection.type === 'cells') {
      const cellData = selection.ranges.map(range => {
        const [colIndex, rowIndex] = range as [number, number]
        const cell = getCellContent([colIndex, rowIndex])
        return cell.displayData || cell.data
      })
      e.clipboardData.setData('text/plain', JSON.stringify(cellData))
      e.preventDefault()
    }
  }, [getCellContent])

  // 粘贴
  const handlePaste = useCallback((selection: CombinedSelection, e: React.ClipboardEvent) => {
    saveHistory()
    const text = e.clipboardData.getData('text/plain')
    console.log('Paste:', text, 'into', selection)
    // 实现粘贴逻辑
  }, [saveHistory])

  // 撤销
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setData(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setData(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  // 搜索
  const handleSearch = useCallback(() => {
    if (!searchText) {
      setSearchResults([])
      return
    }

    const results: ICellItem[] = []
    visibleData.forEach((row, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const cell = getCellContent([colIndex, rowIndex])
        const cellText = String(cell.displayData || cell.data).toLowerCase()
        if (cellText.includes(searchText.toLowerCase())) {
          results.push([colIndex, rowIndex])
        }
      })
    })

    setSearchResults(results)
    setCurrentSearchIndex(0)
    
    if (results.length > 0) {
      gridRef.current?.scrollToItem(results[0])
    }
  }, [searchText, visibleData, columns, getCellContent])

  // 跳转到下一个搜索结果
  const handleNextSearch = useCallback(() => {
    if (searchResults.length === 0) return
    const nextIndex = (currentSearchIndex + 1) % searchResults.length
    setCurrentSearchIndex(nextIndex)
    gridRef.current?.scrollToItem(searchResults[nextIndex])
  }, [searchResults, currentSearchIndex])

  // 搜索高亮
  const searchHitIndex = useMemo(() => {
    return searchResults.map(([colIndex, rowIndex]) => ({
      fieldId: columns[colIndex]?.id || '',
      recordId: visibleData[rowIndex]?.id || '',
    }))
  }, [searchResults, columns, visibleData])

  const searchCursor = useMemo(() => {
    return searchResults[currentSearchIndex] || null
  }, [searchResults, currentSearchIndex])

  // 打开“新建记录”表单
  const openAddForm = useCallback(() => {
    setEditingRecordId(null)
    const init: Record<string, any> = {}
    columns.forEach(c => { (init as any)[c.id] = '' })
    setFormValues(init)
    setShowFormModal(true)
  }, [columns])

  // 打开“编辑记录”表单（按行索引）
  const openEditForm = useCallback((rowIndex: number) => {
    const row = visibleData[rowIndex] as any
    if (!row) return
    setEditingRecordId(String(row.id))
    const init: Record<string, any> = {}
    columns.forEach(c => { (init as any)[c.id] = row[c.id] ?? '' })
    setFormValues(init)
    setShowFormModal(true)
  }, [visibleData, columns])

  return (
    <div className="h-screen w-screen flex flex-col bg-white">
       
        {/* Topbar - 标准紧凑布局 */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-3 py-2 flex items-center justify-between">
            {/* 左侧操作区 */}
            <div className="flex items-center gap-2 text-xs">
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" onClick={handleUndo} title="撤销"><Undo2 className="w-4 h-4" /></button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" onClick={handleRedo} title="重做"><Redo2 className="w-4 h-4" /></button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" onClick={openAddForm} title="新建记录">
                <Plus className="w-4 h-4" />
              </button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="字段配置"><SlidersHorizontal className="w-4 h-4 inline-block mr-1" />字段配置</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="筛选" onClick={() => { setShowFilterPanel(v => !v); setShowSortPanel(false); setShowGroupPanel(false); }}><Filter className="w-4 h-4 inline-block mr-1" />筛选</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="排序" onClick={() => { setShowSortPanel(v => !v); setShowFilterPanel(false); setShowGroupPanel(false); }}><ArrowUpDown className="w-4 h-4 inline-block mr-1" />排序</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="分组" onClick={() => { setShowGroupPanel(v => !v); setShowFilterPanel(false); setShowSortPanel(false); }}><PanelsTopLeft className="w-4 h-4 inline-block mr-1" />分组</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="更多"><Menu className="w-4 h-4" /></button>
            </div>
            {/* 右侧工具区 */}
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="搜索"
                  className="w-48 px-3 py-1 pr-8 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >🔍</button>
              </div>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white">分享</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white">API</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white">协同</button>
            </div>
          </div>
        </div>

        {/* 轻量面板：筛选/排序/分组（占位实现） */}
        {(showFilterPanel || showSortPanel || showGroupPanel) && (
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 text-xs">
            {showFilterPanel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">筛选：</span>
                <select className="px-2 py-1 border rounded" value={simpleFilter.fieldId ?? ''} onChange={e => setSimpleFilter({ ...simpleFilter, fieldId: e.target.value })}>
                  <option value="">选择字段</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input className="px-2 py-1 border rounded" placeholder="包含..." value={simpleFilter.value ?? ''} onChange={e => setSimpleFilter({ ...simpleFilter, value: e.target.value })} />
                <button className="px-2 py-1 border rounded bg-white" onClick={() => setSimpleFilter({})}>清除</button>
              </div>
            )}
            {showSortPanel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">排序：</span>
                <select className="px-2 py-1 border rounded" value={sortCond.fieldId ?? ''} onChange={e => setSortCond({ ...sortCond, fieldId: e.target.value as string })}>
                  <option value="">选择字段</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select className="px-2 py-1 border rounded" value={sortCond.order ?? 'asc'} onChange={e => setSortCond({ ...sortCond, order: e.target.value as any })}>
                  <option value="asc">升序</option>
                  <option value="desc">降序</option>
                </select>
                <button className="px-2 py-1 border rounded bg-white" onClick={() => setSortCond({})}>清除</button>
              </div>
            )}
            {showGroupPanel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">分组：</span>
                <select className="px-2 py-1 border rounded" value={groupByFieldId ?? ''} onChange={e => setGroupByFieldId(e.target.value || undefined)}>
                  <option value="">不分组</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

      {/* Grid 表格区域（紧凑） */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full bg-white overflow-hidden border border-gray-200">
          <Grid
            ref={gridRef}
            columns={columns}
            rowCount={visibleData.length}
            freezeColumnCount={freezeColumnCount}
            draggable={draggable}
            selectable={selectable}
            rowControls={[
              { type: RowControlType.Checkbox },
              { type: RowControlType.Drag },
              {
                type: RowControlType.Custom,
                width: 28,
                render: (rowIndex: number) => (
                  <button
                    type="button"
                    className="px-1.5 py-0.5 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center"
                    onMouseDown={(e) => {
                      // 防止被 Grid 捕获为拖拽/选择事件
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => { e.stopPropagation(); openEditForm(rowIndex) }}
                    title="编辑"
                  ><ArrowUpRight className="w-3.5 h-3.5" /></button>
                ),
              },
            ]}
            groupPoints={groupPoints}
            collapsedGroupIds={collapsedGroupIds}
            columnStatistics={columnStatistics}
            collaborators={collaborators}
            searchCursor={searchCursor}
            searchHitIndex={searchHitIndex}
            getCellContent={getCellContent}
            onCellEdited={handleCellEdited}
            onRowAppend={handleRowAppend}
            onColumnAppend={handleColumnAppend}
            onRowOrdered={handleRowOrdered}
            onColumnOrdered={handleColumnOrdered}
            onColumnResize={handleColumnResize}
            onAddColumn={handleAddColumn}
            onEditColumn={handleEditColumn}
            onDuplicateColumn={handleDuplicateColumn}
            onDeleteColumn={handleDeleteColumn}
            onCollapsedGroupChanged={setCollapsedGroupIds}
            onSelectionChanged={setSelection}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onDelete={handleDelete}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onColumnHeaderClick={(colIndex) => {
              console.log('Column header clicked:', columns[colIndex])
            }}
            onColumnHeaderDblClick={(colIndex) => {
              console.log('Column header double clicked:', columns[colIndex])
            }}
            onCellDblClick={(cell) => {
              const [, rowIndex] = cell
              openEditForm(rowIndex)
            }}
            style={{ width: '100%', height: '100%', fontSize: 12, lineHeight: 1.3 }}
          />
        </div>
      </div>

      {/* 底部状态栏 - 左下角记录统计 */}
      <div className="bg-white border-t border-gray-200 px-3 py-2">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex gap-6">
            <span>记录: <strong>{visibleData.length}</strong></span>
            <span>选择: <strong>{selection?.type || '无'}</strong></span>
            {selection && (
              <span>范围: <strong>{selection.ranges.length}</strong> 个</span>
            )}
          </div>
          <div className="text-gray-400">按 Enter 保存 · Cmd/Ctrl+Z 撤销</div>
        </div>
      </div>
      {showFormModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[800px] max-w-[90vw] bg-white rounded shadow-lg">
            <div className="p-4 border-b text-sm font-medium">{editingRecordId ? '编辑记录' : '新建记录'}</div>
            <div className="p-4 space-y-4">
              {columns.map(col => (
                <div key={col.id} className="flex items-center gap-3">
                  <div className="w-24 text-gray-600 text-sm truncate">{col.name}</div>
                  <input className="flex-1 px-3 py-2 border rounded" value={formValues[col.id] ?? ''} onChange={e => setFormValues({ ...formValues, [col.id]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex justify-end gap-2">
              <button className="px-3 py-1.5 border rounded" onClick={() => setShowFormModal(false)}>取消</button>
              <button className="px-3 py-1.5 bg-gray-900 text-white rounded" onClick={async () => {
                try {
                  await ensureLogin()
                  const tableId = getEffectiveTableId(props.tableId || 'demo')
                  const fields: Record<string, any> = {}
                  Object.entries(formValues).forEach(([fid, v]) => {
                    const name = fieldIdToName[fid] || fid
                    fields[name] = v === '' ? null : v
                  })
                  if (editingRecordId) {
                    await teable.updateRecord({ table_id: tableId, record_id: editingRecordId, fields })
                  } else {
                    const res = await teable.createRecord({ table_id: tableId, fields })
                    setData(prev => [{ id: res.data.id, ...(prev[0] || {}), ...Object.fromEntries(Object.entries(formValues)) } as any, ...prev])
                  }
                  setShowFormModal(false)
                } catch (e) {
                  console.error('表单提交失败', e)
                }
              }}>{editingRecordId ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
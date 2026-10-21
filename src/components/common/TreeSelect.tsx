import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, ChevronRight, Check, X, Search, CheckSquare, Square, MinusSquare } from 'lucide-react';

export interface TreeNode {
  id: string;
  label: string;
  description?: string;
  children?: TreeNode[];
  badge?: string;
}

interface TreeSelectProps {
  id?: string;
  name?: string;
  data: TreeNode[];
  value: string[]; // selected leaf or node ids
  onChange: (selectedIds: string[], selectedLabels: string[]) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  required?: boolean;
}

export default function TreeSelect({
  id,
  name,
  data,
  value,
  onChange,
  placeholder = '请选择...',
  className = '',
  searchable = true,
  required = false,
}: TreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueHtmlId = useId();
  const selectElementId = id || uniqueHtmlId;

  // Auto-expand all top nodes on mount or open
  useEffect(() => {
    if (isOpen) {
      const initialExpanded: Record<string, boolean> = {};
      const traverse = (nodes: TreeNode[]) => {
        nodes.forEach((n) => {
          if (n.children && n.children.length > 0) {
            initialExpanded[n.id] = true;
            traverse(n.children);
          }
        });
      };
      traverse(data);
      setExpandedIds(initialExpanded);
    }
  }, [isOpen, data]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to collect all leaf node IDs under a parent
  const getAllChildLeafIds = (node: TreeNode): string[] => {
    if (!node.children || node.children.length === 0) {
      return [node.id];
    }
    return node.children.flatMap((c) => getAllChildLeafIds(c));
  };

  // Helper to find node by ID and get its label
  const findNode = (nodes: TreeNode[], targetId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Check state of a node: 'checked' | 'indeterminate' | 'unchecked'
  const getNodeCheckState = (node: TreeNode): 'checked' | 'indeterminate' | 'unchecked' => {
    const leafIds = getAllChildLeafIds(node);
    const checkedCount = leafIds.filter((lid) => value.includes(lid)).length;

    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === leafIds.length) return 'checked';
    return 'indeterminate';
  };

  // Toggle selection for a node
  const handleToggleNode = (node: TreeNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const leafIds = getAllChildLeafIds(node);
    const currentState = getNodeCheckState(node);

    let nextValue: string[];
    if (currentState === 'checked') {
      // Uncheck all child leaf nodes
      nextValue = value.filter((id) => !leafIds.includes(id));
    } else {
      // Check all child leaf nodes
      const toAdd = leafIds.filter((id) => !value.includes(id));
      nextValue = [...value, ...toAdd];
    }

    const nextLabels = nextValue
      .map((id) => findNode(data, id)?.label)
      .filter((l): l is string => Boolean(l));

    onChange(nextValue, nextLabels);
  };

  const handleToggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([], []);
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allLeafs: string[] = [];
    const traverse = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (!n.children || n.children.length === 0) {
          allLeafs.push(n.id);
        } else {
          traverse(n.children);
        }
      });
    };
    traverse(data);
    const nextLabels = allLeafs
      .map((id) => findNode(data, id)?.label)
      .filter((l): l is string => Boolean(l));
    onChange(allLeafs, nextLabels);
  };

  // Find labels of selected items
  const selectedNodes = value
    .map((id) => findNode(data, id))
    .filter((n): n is TreeNode => Boolean(n));

  // Render tree node recursively
  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = Boolean(expandedIds[node.id]);
    const checkState = getNodeCheckState(node);

    // Filter check
    if (filterText.trim()) {
      const q = filterText.trim().toLowerCase();
      const matchSelf = node.label.toLowerCase().includes(q) || (node.description || '').toLowerCase().includes(q);
      const matchChild = hasChildren && getAllChildLeafIds(node).some(id => {
        const child = findNode(data, id);
        return child?.label.toLowerCase().includes(q);
      });
      if (!matchSelf && !matchChild) return null;
    }

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={(e) => handleToggleNode(node, e)}
          className={`flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-100/90 transition-colors cursor-pointer group ${
            checkState === 'checked' ? 'bg-indigo-50/70 text-indigo-900' : 'text-slate-700'
          }`}
          style={{ paddingLeft: `${Math.max(12, level * 20 + 12)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Expand / Collapse toggle icon */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => handleToggleExpand(node.id, e)}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            ) : (
              <span className="w-5 h-5 shrink-0" />
            )}

            {/* Checkbox icon */}
            <div className="shrink-0 flex items-center">
              {checkState === 'checked' && (
                <div className="w-4.5 h-4.5 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
              {checkState === 'indeterminate' && (
                <div className="w-4.5 h-4.5 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <MinusSquare className="w-3.5 h-3.5 fill-current" />
                </div>
              )}
              {checkState === 'unchecked' && (
                <div className="w-4.5 h-4.5 rounded-md border-2 border-slate-300 group-hover:border-indigo-400 bg-white transition-colors" />
              )}
            </div>

            {/* Node Label */}
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className={`text-sm truncate ${hasChildren ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                {node.label}
              </span>
              {node.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                  {node.badge}
                </span>
              )}
            </div>
          </div>

          {/* Child count hint */}
          {hasChildren && node.children && (
            <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
              {node.children.length} 项
            </span>
          )}
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && node.children && (
          <div className="space-y-0.5 relative before:absolute before:left-[19px] before:top-1 before:bottom-2 before:w-px before:bg-slate-200">
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden native select for HTML accessibility & DOM compatibility */}
      <select
        id={selectElementId}
        name={name}
        multiple
        value={value}
        onChange={() => {}}
        required={required && value.length === 0}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        {data.map((node) => (
          <option key={node.id} value={node.id}>
            {node.label}
          </option>
        ))}
      </select>

      {/* Trigger Display Box */}
      <div
        id={`${selectElementId}-display`}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[50px] px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
          isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''
        }`}
      >
        <div className="flex-1 flex flex-wrap gap-1.5 items-center min-w-0 overflow-hidden">
          {selectedNodes.length === 0 ? (
            <span className="text-sm text-slate-400 select-none">{placeholder}</span>
          ) : selectedNodes.length <= 3 ? (
            selectedNodes.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-indigo-100"
              >
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextVal = value.filter((id) => id !== item.id);
                    const nextLabels = nextVal
                      .map((id) => findNode(data, id)?.label)
                      .filter((l): l is string => Boolean(l));
                    onChange(nextVal, nextLabels);
                  }}
                  className="hover:text-indigo-900 rounded-full p-0.5 hover:bg-indigo-200/50 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-indigo-100">
                {selectedNodes[0].label}
              </span>
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-indigo-100">
                {selectedNodes[1].label}
              </span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-100/70 px-2 py-1 rounded-xl">
                +{selectedNodes.length - 2} 项
              </span>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="清空全部已选"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </div>
      </div>

      {/* Tree Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Action Bar: Search & Quick select buttons */}
          <div className="space-y-2 pb-2 border-b border-slate-100">
            {searchable && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="搜索分类或具体类型..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {filterText && (
                  <button
                    type="button"
                    onClick={() => setFilterText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-medium">
                已勾选 <strong className="text-indigo-600 font-bold">{value.length}</strong> 项
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                >
                  全选
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                >
                  清空
                </button>
              </div>
            </div>
          </div>

          {/* Tree Scrollable Container */}
          <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {data.map((node) => renderTreeNode(node))}
          </div>

          {/* Bottom Confirm Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">支持展开层级树状多选</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              完成选择
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

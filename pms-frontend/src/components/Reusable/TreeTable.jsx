import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const TreeTable = ({
  columns,
  data,
  actions,
  onDelete,
  childrenProperty = 'children',
  indentSize = 40,
}) => {
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [isEditMode, setIsEditMode] = useState(true);
  const buttonWidth = 30;

  const flattenData = (nodes, level = 0, parentPath = '') => {
    let flatData = [];
    nodes.forEach((node, index) => {
      const path = parentPath ? `${parentPath}.${index}` : `${index}`;
      flatData.push({
        ...node,
        _level: level,
        _path: path,
        _hasChildren: node[childrenProperty] && node[childrenProperty].length > 0,
      });
      if (expandedNodes.includes(path) && node[childrenProperty]) {
        flatData = [...flatData, ...flattenData(node[childrenProperty], level + 1, path)];
      }
    });
    return flatData;
  };

  const flattenedData = flattenData(data);

  const toggleExpand = (path) => {
    setExpandedNodes((prev) => {
      const isCurrentlyExpanded = prev.includes(path);

      if (isCurrentlyExpanded) {
        return prev.filter((p) => p !== path);
      } else {
      
        const pathParts = path.split('.');
        const level = pathParts.length;
        const parentPath = level > 1 ? pathParts.slice(0, -1).join('.') : null;

        const siblingsCollapsed = prev.filter(p => {
          const pParts = p.split('.');
          const pLevel = pParts.length;
          if (pLevel !== level) return true; 

          const pParentPath = pLevel > 1 ? pParts.slice(0, -1).join('.') : null;
          const isSibling = pParentPath === parentPath;

          return !isSibling; 
        });

        return [...siblingsCollapsed, path];
      }
    });
  };

  const getLastDirectChildPosition = (parentPath) => {
    let lastChildPosition = -1;
    const parentLevel = parentPath.split('.').length - 1;

    for (let i = 0; i < flattenedData.length; i++) {
      const row = flattenedData[i];
      if (row._path.startsWith(parentPath) && row._level === parentLevel + 1) {
        lastChildPosition = i;
      } else if (row._level <= parentLevel) {
        break;
      }
    }
    return lastChildPosition;
  };

  const getVerticalLineHeight = (path, currentRowIndex) => {
    const nodeData = path.split('.').reduce((acc, idx) => acc[parseInt(idx)][childrenProperty], data);
    if (!nodeData || !expandedNodes.includes(path)) {
      return 48;
    }

    const parentPosition = flattenedData.findIndex(row => row._path === path);
    const lastChildPosition = getLastDirectChildPosition(path);

    if (lastChildPosition === -1 || parentPosition === -1) return 48;
    if (currentRowIndex < parentPosition || currentRowIndex > lastChildPosition) return 0;

    const rowHeight = 48;
    const rowsSpanned = lastChildPosition - parentPosition;
    const lastRowHeight = rowsSpanned === 0 ? rowHeight / 2 : rowHeight;
    return rowsSpanned * rowHeight + lastRowHeight;
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-lg bg-white shadow-sm overflow-auto">
      <div className="justify-end items-center px-6 py-4 bg-gray border-b border-gray-200 rounded-t-lg w-full z-1000">
        <div className="text-lg font-semibold text-gray-700"></div>
        <div className="justify-end flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Edit Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEditMode}
              onChange={() => setIsEditMode(!isEditMode)}
            />
            {/* Toggle Track */}
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#6E8C48] transition-colors duration-300">
              {/* Toggle Thumb */}
              <div
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  isEditMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead style={{ backgroundColor: '#F2F2F2' }} className="text-gray-700 uppercase text-xs font-semibold sticky top-0 z-10">
          <tr>
            {columns.map((column, idx) => (
              <th key={idx} className="px-6 py-3 text-left">{column.header}</th>
            ))}
            {isEditMode && <th className="px-6 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {flattenedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-3 whitespace-nowrap text-gray-700">
                  {colIndex === 0 ? (
                    <div className="flex items-center relative">
                      <div className="absolute left-0 -top-8 -bottom-10 flex items-center">
                        {Array.from({ length: row._level }).map((_, i) => {
                          const parentPath = row._path.split('.').slice(0, -(i + 1)).join('.');
                          const lineHeight = getVerticalLineHeight(parentPath, rowIndex) + 18;
                          if (lineHeight === 0) return null;

                          return (
                            <div
                              key={i}
                              className="relative h-full"
                              style={{
                                width: `${indentSize}px`,
                                marginLeft: `${indentSize}px`,
                              }}
                            >
                              <div
                                className="absolute w-[2px] bg-[#6E8C48] left-1/2 transform -translate-x-1/2"
                                style={{ height: `${lineHeight}px` }}
                              ></div>
                              {i === row._level - 1 && (
                                <div
                                  className="absolute h-[2px] bg-[#6E8C48]"
                                  style={{
                                    top: '45%',
                                    left: '50%',
                                    width: `${indentSize - 5}px`,
                                    transform: 'translateY(-50%)',
                                  }}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div
                        className="flex items-center"
                        style={{
                          paddingLeft: `${row._level * (indentSize + buttonWidth + 1)}px`,
                        }}
                      >
                        {row._hasChildren && (
                          <button
                            onClick={() => toggleExpand(row._path)}
                            className="w-6 h-6 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center mr-2"
                          >
                            {expandedNodes.includes(row._path) ? (
                              <ArrowDropDownIcon fontSize="small" className="text-gray-600" />
                            ) : (
                              <ArrowRightIcon fontSize="small" className="text-gray-600" />
                            )}
                          </button>
                        )}
                        <span className="truncate">{column.render ? column.render(row[column.accessor], row) : row[column.accessor]}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {column.accessor === "status" ? (
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          row.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {row.status}
                        </span>
                      ) : (
                        column.render ? column.render(row[column.accessor], row) : row[column.accessor]
                      )}
                    </div>
                  )}
                </td>
              ))}
              {isEditMode && (
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {actions && actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => action.onClick(row)}
                        title={action.label || action.type}
                        className="p-2 rounded hover:bg-gray-100 text-gray-600"
                      >
                        {action.icon}
                      </button>
                    ))}
                    <button
                      onClick={() => onDelete && onDelete(row)}
                      title="Delete"
                      className="p-2 rounded hover:bg-gray-100 text-gray-600"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TreeTable;
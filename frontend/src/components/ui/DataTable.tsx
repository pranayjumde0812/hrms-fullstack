import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Input } from './components';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
}

export function DataTable<T extends Record<string, any>>({ data, columns, searchKey }: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = React.useMemo(() => {
    let result = [...data];
    if (searchTerm && searchKey) {
      result = result.filter((item) => 
        String(item[searchKey as string]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchTerm, searchKey, sortConfig]);

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={`Search by ${String(searchKey)}...`} 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    className="px-6 py-3 font-medium tracking-wider cursor-pointer hover:bg-muted"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {sortConfig?.key === col.key && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-card-foreground">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-muted/50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

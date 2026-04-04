import React, { useState } from 'react';
import { Badge, Button, Input, Label, Textarea } from '@/components/ui/components';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const DepartmentsView = () => {
  const queryClient = useQueryClient();
  const { user: authedUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDept, setEditDept] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then((res: any) => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/departments', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setShowAddModal(false); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/departments/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setEditDept(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setDeleteConfirm(null); }
  });

  const isHR = authedUser && ['SUPER_ADMIN', 'HR_MANAGER'].includes(authedUser.role);

  const columns = [
    { key: 'name', header: 'Department Name' },
    { key: 'description', header: 'Description', render: (row: any) => <span className="text-muted-foreground">{row.description || '—'}</span> },
    { key: '_count', header: 'Employees', render: (row: any) => <Badge variant={row._count?.users > 0 ? 'success' : 'default'}>{row._count?.users || 0} Members</Badge> },
    { key: 'createdAt', header: 'Created', render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
    ...(isHR ? [{ key: 'actions', header: 'Actions', render: (row: any) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setEditDept(row)} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
        {authedUser?.role === 'SUPER_ADMIN' && (
          <button onClick={() => setDeleteConfirm(row)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
        )}
      </div>
    )}] : [])
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">Organize your company structure with departments.</p>
        </div>
        {isHR && <Button onClick={() => setShowAddModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Department</Button>}
      </div>
      <DataTable data={departments || []} columns={columns} searchKey="name" />

      {/* Add Department Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Department">
        <DepartmentForm onSubmit={(data: any) => createMutation.mutate(data)} loading={createMutation.isPending} />
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={!!editDept} onClose={() => setEditDept(null)} title="Edit Department">
        {editDept && <DepartmentForm initialData={editDept} onSubmit={(data: any) => updateMutation.mutate({ id: editDept.id, ...data })} loading={updateMutation.isPending} buttonText="Save Changes" />}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Department" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? Employees in this department will become unassigned.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function DepartmentForm({ initialData, onSubmit, loading, buttonText = 'Create Department' }: { initialData?: any, onSubmit: (data: any) => void, loading: boolean, buttonText?: string }) {
  const [form, setForm] = useState({ name: initialData?.name || '', description: initialData?.description || '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: form.name, description: form.description || undefined });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Department Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Engineering" /></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." /></div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : buttonText}</Button>
      </div>
    </form>
  );
}

export default DepartmentsView;

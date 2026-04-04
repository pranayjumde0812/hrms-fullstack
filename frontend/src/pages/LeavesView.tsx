import React, { useState } from 'react';
import { Badge, Button, Input, Label, Select, Textarea } from '@/components/ui/components';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Check, X } from 'lucide-react';

export const LeavesView = () => {
  const queryClient = useQueryClient();
  const { user: authedUser } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: () => api.get('/leaves').then((res: any) => res.data)
  });

  const applyMutation = useMutation({
    mutationFn: (data: any) => api.post('/leaves', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setShowApplyModal(false); }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.patch(`/leaves/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); }
  });

  const isHR = authedUser && ['SUPER_ADMIN', 'HR_MANAGER'].includes(authedUser.role);

  const columns = [
    { key: 'user', header: 'Employee', render: (row: any) => row.user ? `${row.user.firstName} ${row.user.lastName}` : 'N/A' },
    { key: 'type', header: 'Type', render: (row: any) => {
      const variant = row.type === 'SICK' ? 'destructive' : row.type === 'PAID' ? 'success' : 'warning';
      return <Badge variant={variant}>{row.type}</Badge>;
    }},
    { key: 'startDate', header: 'From', render: (row: any) => new Date(row.startDate).toLocaleDateString() },
    { key: 'endDate', header: 'To', render: (row: any) => new Date(row.endDate).toLocaleDateString() },
    { key: 'duration', header: 'Days', render: (row: any) => {
      const start = new Date(row.startDate);
      const end = new Date(row.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return <span className="font-semibold">{days}</span>;
    }},
    { key: 'reason', header: 'Reason', render: (row: any) => <span className="text-muted-foreground text-xs">{row.reason || '—'}</span> },
    { key: 'status', header: 'Status', render: (row: any) => {
      const variant = row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'destructive' : 'warning';
      return <Badge variant={variant}>{row.status}</Badge>;
    }},
    ...(isHR ? [{ key: 'actions', header: 'Actions', render: (row: any) => row.status === 'PENDING' ? (
      <div className="flex items-center gap-1">
        <button onClick={() => statusMutation.mutate({ id: row.id, status: 'APPROVED' })} className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-muted-foreground hover:text-emerald-600 transition-colors" title="Approve"><Check className="h-4 w-4" /></button>
        <button onClick={() => statusMutation.mutate({ id: row.id, status: 'REJECTED' })} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors" title="Reject"><X className="h-4 w-4" /></button>
      </div>
    ) : <span className="text-xs text-muted-foreground">—</span> }] : [])
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">Apply for leaves and manage employee leave requests.</p>
        </div>
        <Button onClick={() => setShowApplyModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Apply for Leave</Button>
      </div>
      <DataTable data={leaves || []} columns={columns} searchKey="type" />

      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Leave">
        <LeaveForm onSubmit={(data: any) => applyMutation.mutate(data)} loading={applyMutation.isPending} />
      </Modal>
    </div>
  );
};

function LeaveForm({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [form, setForm] = useState({ type: 'CASUAL', startDate: tomorrow.toISOString().split('T')[0], endDate: tomorrow.toISOString().split('T')[0], reason: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, reason: form.reason || undefined });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Leave Type</Label>
        <Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
          <option value="CASUAL">Casual Leave</option>
          <option value="SICK">Sick Leave</option>
          <option value="PAID">Paid Leave</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} required /></div>
      </div>
      <div className="space-y-2"><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Optional reason for leave..." /></div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Applying...' : 'Apply for Leave'}</Button>
      </div>
    </form>
  );
}

export default LeavesView;

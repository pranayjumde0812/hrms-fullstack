import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label, Select, Textarea } from '@/components/ui/components';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Briefcase, Clock, DollarSign, Building2, Calendar, Plus, Pencil, Trash2, Check, X, UserPlus } from 'lucide-react';

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
export const DashboardView = () => {
  const { user } = useAuth();
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => api.get('/dashboard/stats').then((res: any) => res.data) });

  const statCards = [
    { title: "Total Employees", value: stats?.totalEmployees ?? '—', icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { title: "Active Projects", value: stats?.activeProjects ?? '—', icon: Briefcase, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
    { title: "Pending Timesheets", value: stats?.pendingTimesheets ?? '—', icon: Clock, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
    { title: "Total Payroll", value: stats?.totalPayroll != null ? `$${Number(stats.totalPayroll).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—', icon: DollarSign, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "Departments", value: stats?.totalDepartments ?? '—', icon: Building2, color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30" },
    { title: "Pending Leaves", value: stats?.pendingLeaves ?? '—', icon: Calendar, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user?.firstName} {user?.lastName}. Here's an overview of your organization.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// EMPLOYEES
// ─────────────────────────────────────────────
export const EmployeesView = () => {
  const queryClient = useQueryClient();
  const { user: authedUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/users').then((res: any) => res.data) });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => api.get('/departments').then((res: any) => res.data) });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/users', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setShowAddModal(false); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/users/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setEditUser(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setDeleteConfirm(null); }
  });

  const columns = [
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department', render: (row: any) => row.department?.name || <span className="text-muted-foreground italic">Unassigned</span> },
    { key: 'role', header: 'Role', render: (row: any) => <Badge variant={row.role === 'SUPER_ADMIN' ? 'destructive' : row.role === 'HR_MANAGER' ? 'warning' : 'default'}>{row.role.replace(/_/g, ' ')}</Badge> },
    { key: 'baseSalary', header: 'Base Salary', render: (row: any) => `$${(row.baseSalary || 0).toLocaleString()}` },
    { key: 'actions', header: 'Actions', render: (row: any) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setEditUser(row)} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
        {authedUser?.role === 'SUPER_ADMIN' && row.id !== authedUser.id && (
          <button onClick={() => setDeleteConfirm(row)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
        )}
      </div>
    )}
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage your workforce, assign roles, and set compensation.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Employee</Button>
      </div>
      <DataTable data={users || []} columns={columns} searchKey="firstName" />

      {/* Add Employee Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee">
        <EmployeeForm departments={departments || []} onSubmit={(data: any) => createMutation.mutate(data)} loading={createMutation.isPending} />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit Employee">
        {editUser && <EmployeeEditForm user={editUser} departments={departments || []} onSubmit={(data: any) => updateMutation.mutate({ id: editUser.id, ...data })} loading={updateMutation.isPending} />}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Employee" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteConfirm?.firstName} {deleteConfirm?.lastName}</strong>? This action cannot be undone.</p>
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

function EmployeeForm({ departments, onSubmit, loading }: { departments: any[], onSubmit: (data: any) => void, loading: boolean }) {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'EMPLOYEE', baseSalary: 0, hourlyRate: 0, joiningDate: new Date().toISOString().split('T')[0], departmentId: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      baseSalary: Number(form.baseSalary),
      hourlyRate: Number(form.hourlyRate),
      departmentId: form.departmentId ? Number(form.departmentId) : undefined
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required /></div>
      </div>
      <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
      <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            <option value="EMPLOYEE">Employee</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
            <option value="">No Department</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Base Salary</Label><Input type="number" value={form.baseSalary} onChange={e => setForm(p => ({ ...p, baseSalary: Number(e.target.value) }))} min={0} /></div>
        <div className="space-y-2"><Label>Hourly Rate</Label><Input type="number" value={form.hourlyRate} onChange={e => setForm(p => ({ ...p, hourlyRate: Number(e.target.value) }))} min={0} /></div>
        <div className="space-y-2"><Label>Joining Date</Label><Input type="date" value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))} required /></div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</Button>
      </div>
    </form>
  );
}

function EmployeeEditForm({ user, departments, onSubmit, loading }: { user: any, departments: any[], onSubmit: (data: any) => void, loading: boolean }) {
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, role: user.role, baseSalary: user.baseSalary || 0, hourlyRate: user.hourlyRate || 0, departmentId: user.departmentId || '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      baseSalary: Number(form.baseSalary),
      hourlyRate: Number(form.hourlyRate),
      departmentId: form.departmentId ? Number(form.departmentId) : null
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            <option value="EMPLOYEE">Employee</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
            <option value="">No Department</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Base Salary</Label><Input type="number" value={form.baseSalary} onChange={e => setForm(p => ({ ...p, baseSalary: Number(e.target.value) }))} min={0} /></div>
        <div className="space-y-2"><Label>Hourly Rate</Label><Input type="number" value={form.hourlyRate} onChange={e => setForm(p => ({ ...p, hourlyRate: Number(e.target.value) }))} min={0} /></div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────
export const ProjectsView = () => {
  const queryClient = useQueryClient();
  const { user: authedUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignProject, setAssignProject] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => api.get('/projects').then((res: any) => res.data) });
  const { data: allUsers } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/users').then((res: any) => res.data) });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/projects', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setShowAddModal(false); }
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, userIds }: { id: number, userIds: number[] }) => api.post(`/projects/${id}/assign`, { userIds }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setAssignProject(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setDeleteConfirm(null); }
  });

  const isManager = authedUser && ['SUPER_ADMIN', 'PROJECT_MANAGER'].includes(authedUser.role);

  const columns = [
    { key: 'name', header: 'Project Name' },
    { key: 'description', header: 'Description', render: (row: any) => <span className="text-muted-foreground">{row.description || '—'}</span> },
    { key: 'startDate', header: 'Start Date', render: (row: any) => new Date(row.startDate).toLocaleDateString() },
    { key: 'users', header: 'Team', render: (row: any) => <Badge variant="warning">{row.users?.length || 0} Members</Badge> },
    ...(isManager ? [{ key: 'actions', header: 'Actions', render: (row: any) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setAssignProject(row)} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors" title="Assign members"><UserPlus className="h-4 w-4" /></button>
        {authedUser?.role === 'SUPER_ADMIN' && <button onClick={() => setDeleteConfirm(row)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>}
      </div>
    )}] : [])
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Active initiatives and their assigned personnel.</p>
        </div>
        {isManager && <Button onClick={() => setShowAddModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Project</Button>}
      </div>
      <DataTable data={projects || []} columns={columns} searchKey="name" />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Project">
        <ProjectForm onSubmit={(data: any) => createMutation.mutate(data)} loading={createMutation.isPending} />
      </Modal>

      <Modal isOpen={!!assignProject} onClose={() => setAssignProject(null)} title={`Assign Members to "${assignProject?.name}"`}>
        {assignProject && <AssignMembersForm project={assignProject} allUsers={allUsers || []} onSubmit={(userIds: number[]) => assignMutation.mutate({ id: assignProject.id, userIds })} loading={assignMutation.isPending} />}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Project" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete project <strong>{deleteConfirm?.name}</strong>?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function ProjectForm({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) {
  const [form, setForm] = useState({ name: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, endDate: form.endDate || undefined });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Project Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional project description..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</Button>
      </div>
    </form>
  );
}

function AssignMembersForm({ project, allUsers, onSubmit, loading }: { project: any, allUsers: any[], onSubmit: (ids: number[]) => void, loading: boolean }) {
  const existingIds = new Set((project.users || []).map((u: any) => u.id));
  const [selected, setSelected] = useState<number[]>([]);

  const availableUsers = allUsers.filter((u: any) => !existingIds.has(u.id));

  const toggle = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      {project.users?.length > 0 && (
        <div>
          <Label className="mb-2 block">Current Members</Label>
          <div className="flex flex-wrap gap-2">
            {project.users.map((u: any) => <Badge key={u.id} variant="success">{u.firstName} {u.lastName}</Badge>)}
          </div>
        </div>
      )}
      <div>
        <Label className="mb-2 block">Select Members to Add</Label>
        {availableUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">All users are already assigned.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
            {availableUsers.map((u: any) => (
              <label key={u.id} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} className="rounded" />
                <span className="text-sm">{u.firstName} {u.lastName}</span>
                <span className="text-xs text-muted-foreground ml-auto">{u.email}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={() => onSubmit(selected)} disabled={loading || selected.length === 0}>{loading ? 'Assigning...' : `Assign ${selected.length} Member${selected.length !== 1 ? 's' : ''}`}</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TIMESHEETS
// ─────────────────────────────────────────────
export const TimesheetsView = () => {
  const queryClient = useQueryClient();
  const { user: authedUser } = useAuth();
  const [showLogModal, setShowLogModal] = useState(false);

  const { data: timesheets, isLoading } = useQuery({ queryKey: ['timesheets'], queryFn: () => api.get('/timesheets').then((res: any) => res.data) });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => api.get('/projects').then((res: any) => res.data) });

  const logMutation = useMutation({
    mutationFn: (data: any) => api.post('/timesheets', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timesheets'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setShowLogModal(false); }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => api.patch(`/timesheets/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timesheets'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); }
  });

  const isApprover = authedUser && ['SUPER_ADMIN', 'PROJECT_MANAGER'].includes(authedUser.role);

  const columns = [
    { key: 'date', header: 'Date', render: (row: any) => new Date(row.date).toLocaleDateString() },
    { key: 'user', header: 'Employee', render: (row: any) => row.user ? `${row.user.firstName} ${row.user.lastName}` : 'N/A' },
    { key: 'project', header: 'Project', render: (row: any) => row.project?.name || 'N/A' },
    { key: 'hours', header: 'Hours', render: (row: any) => <span className="font-semibold">{row.hours}h</span> },
    { key: 'notes', header: 'Notes', render: (row: any) => <span className="text-muted-foreground text-xs">{row.notes || '—'}</span> },
    { key: 'status', header: 'Status', render: (row: any) => {
      const variant = row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'destructive' : 'warning';
      return <Badge variant={variant}>{row.status}</Badge>;
    }},
    ...(isApprover ? [{ key: 'actions', header: 'Actions', render: (row: any) => row.status === 'PENDING' ? (
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
          <h2 className="text-3xl font-bold tracking-tight">Timesheets</h2>
          <p className="text-muted-foreground">Monitor and approve employee working hours.</p>
        </div>
        <Button onClick={() => setShowLogModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Log Hours</Button>
      </div>
      <DataTable data={timesheets || []} columns={columns} searchKey="date" />

      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Log Timesheet Hours">
        <TimesheetForm projects={projects || []} onSubmit={(data: any) => logMutation.mutate(data)} loading={logMutation.isPending} />
      </Modal>
    </div>
  );
};

function TimesheetForm({ projects, onSubmit, loading }: { projects: any[], onSubmit: (data: any) => void, loading: boolean }) {
  const [form, setForm] = useState({ projectId: '', date: new Date().toISOString().split('T')[0], hours: 8, notes: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, projectId: Number(form.projectId), hours: Number(form.hours), notes: form.notes || undefined });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Project</Label>
        <Select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} required>
          <option value="">Select a project...</option>
          {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>Hours</Label><Input type="number" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: Number(e.target.value) }))} min={0.5} max={24} step={0.5} required /></div>
      </div>
      <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." /></div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Logging...' : 'Log Hours'}</Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// PAYROLL
// ─────────────────────────────────────────────
export const PayrollView = () => {
  const queryClient = useQueryClient();
  const { user: authedUser } = useAuth();
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const { data: payrolls, isLoading } = useQuery({ queryKey: ['payrolls'], queryFn: () => api.get('/payroll').then((res: any) => res.data) });
  const { data: allUsers } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/users').then((res: any) => res.data) });

  const generateMutation = useMutation({
    mutationFn: (data: any) => api.post('/payroll/generate', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payrolls'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); setShowGenerateModal(false); }
  });

  const isHR = authedUser && ['SUPER_ADMIN', 'HR_MANAGER'].includes(authedUser.role);

  const columns = [
    { key: 'user', header: 'Employee', render: (row: any) => row.user ? `${row.user.firstName} ${row.user.lastName}` : 'N/A' },
    { key: 'month', header: 'Period', render: (row: any) => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[row.month - 1]} ${row.year}`;
    }},
    { key: 'baseAmount', header: 'Base Pay', render: (row: any) => `$${row.baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { key: 'hourlyAmount', header: 'Variables', render: (row: any) => `$${row.hourlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { key: 'deductions', header: 'Deductions', render: (row: any) => <span className="text-red-500">-${row.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> },
    { key: 'netPay', header: 'Net Salary', render: (row: any) => <span className="font-bold text-emerald-600">${row.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> }
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Pipeline</h2>
          <p className="text-muted-foreground">Compensation engine calculating base, variables, and deductions.</p>
        </div>
        {isHR && <Button onClick={() => setShowGenerateModal(true)} className="gap-2"><DollarSign className="h-4 w-4" /> Generate Payroll</Button>}
      </div>
      <DataTable data={payrolls || []} columns={columns} searchKey="user" />

      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Payroll">
        <PayrollForm users={allUsers || []} onSubmit={(data: any) => generateMutation.mutate(data)} loading={generateMutation.isPending} />
      </Modal>
    </div>
  );
};

function PayrollForm({ users, onSubmit, loading }: { users: any[], onSubmit: (data: any) => void, loading: boolean }) {
  const now = new Date();
  const [form, setForm] = useState({ userId: '', month: now.getMonth() + 1, year: now.getFullYear() });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, userId: Number(form.userId), month: Number(form.month), year: Number(form.year) });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Employee</Label>
        <Select value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required>
          <option value="">Select an employee...</option>
          {users.map((u: any) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Month</Label>
          <Select value={form.month} onChange={e => setForm(p => ({ ...p, month: Number(e.target.value) }))}>
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </Select>
        </div>
        <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))} min={2000} /></div>
      </div>
      <p className="text-xs text-muted-foreground">Payroll is calculated from approved timesheets for the selected period. Base salary + (hourly rate × approved hours) - 10% tax deduction.</p>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Payroll'}</Button>
      </div>
    </form>
  );
}

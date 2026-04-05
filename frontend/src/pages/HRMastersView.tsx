import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from '@/components/ui/components';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

type WorkLocation = {
  id: number;
  name: string;
  code: string;
  timeZone: string;
  address?: string | null;
  isActive: boolean;
  _count?: { users: number; attendancePolicies: number };
};

type AttendancePolicy = {
  id: number;
  name: string;
  workLocation?: { id: number; name: string; code: string; timeZone: string } | null;
  standardWorkingHours: number;
  lateAfterMinutes: number;
  halfDayAfterMinutes: number;
  halfDayMinWorkingHours: number;
  graceMinutes: number;
  overtimeAllowed: boolean;
  autoAbsentEnabled: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

type WeeklyOffRule = {
  id: number;
  name: string;
  workLocation?: { id: number; name: string; code: string } | null;
  weekDay: number;
  weekNumberInMonth?: number | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
};

const weekDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export function HRMastersView() {
  const queryClient = useQueryClient();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showWeeklyOffModal, setShowWeeklyOffModal] = useState(false);

  const { data: workLocations = [] } = useQuery({
    queryKey: ['work-locations'],
    queryFn: () => api.get('/work-locations').then((res: any) => res.data as WorkLocation[]),
  });

  const { data: attendancePolicies = [] } = useQuery({
    queryKey: ['attendance-policies'],
    queryFn: () => api.get('/attendance-policies').then((res: any) => res.data as AttendancePolicy[]),
  });

  const { data: weeklyOffRules = [] } = useQuery({
    queryKey: ['weekly-off-rules'],
    queryFn: () => api.get('/weekly-off-rules').then((res: any) => res.data as WeeklyOffRule[]),
  });

  const createLocationMutation = useMutation({
    mutationFn: (data: any) => api.post('/work-locations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-locations'] });
      setShowLocationModal(false);
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/work-locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-locations'] });
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: (data: any) => api.post('/attendance-policies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-policies'] });
      setShowPolicyModal(false);
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/attendance-policies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-policies'] });
    },
  });

  const createWeeklyOffMutation = useMutation({
    mutationFn: (data: any) => api.post('/weekly-off-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-off-rules'] });
      setShowWeeklyOffModal(false);
    },
  });

  const deleteWeeklyOffMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/weekly-off-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-off-rules'] });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">HR Masters</h2>
        <p className="text-muted-foreground">Manage work locations, attendance policies, and weekly-off rules.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Work Locations</CardTitle>
          </div>
          <Button onClick={() => setShowLocationModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Location
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={workLocations}
            searchKey="name"
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'code', header: 'Code' },
              { key: 'timeZone', header: 'Timezone' },
              { key: 'address', header: 'Address', render: (row: WorkLocation) => row.address || '—' },
              { key: 'status', header: 'Status', render: (row: WorkLocation) => <Badge variant={row.isActive ? 'success' : 'default'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
              { key: 'usage', header: 'Usage', render: (row: WorkLocation) => `${row._count?.users ?? 0} users · ${row._count?.attendancePolicies ?? 0} policies` },
              {
                key: 'actions',
                header: 'Actions',
                render: (row: WorkLocation) => (
                  <button onClick={() => deleteLocationMutation.mutate(row.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Policies</CardTitle>
          <Button onClick={() => setShowPolicyModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Policy
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={attendancePolicies}
            searchKey="name"
            columns={[
              { key: 'name', header: 'Policy' },
              { key: 'workLocation', header: 'Location', render: (row: AttendancePolicy) => row.workLocation?.name || 'Global' },
              { key: 'hours', header: 'Hours', render: (row: AttendancePolicy) => `${row.standardWorkingHours}h` },
              { key: 'late', header: 'Late After', render: (row: AttendancePolicy) => formatMinutes(row.lateAfterMinutes) },
              { key: 'halfDay', header: 'Half Day After', render: (row: AttendancePolicy) => formatMinutes(row.halfDayAfterMinutes) },
              { key: 'status', header: 'Status', render: (row: AttendancePolicy) => <Badge variant={row.isActive ? 'success' : 'default'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
              {
                key: 'actions',
                header: 'Actions',
                render: (row: AttendancePolicy) => (
                  <button onClick={() => deletePolicyMutation.mutate(row.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weekly Off Rules</CardTitle>
          <Button onClick={() => setShowWeeklyOffModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Weekly Off Rule
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={weeklyOffRules}
            searchKey="name"
            columns={[
              { key: 'name', header: 'Rule' },
              { key: 'workLocation', header: 'Location', render: (row: WeeklyOffRule) => row.workLocation?.name || 'Global' },
              { key: 'weekDay', header: 'Weekday', render: (row: WeeklyOffRule) => weekDayLabels[row.weekDay] },
              { key: 'weekNumberInMonth', header: 'Occurrence', render: (row: WeeklyOffRule) => (row.weekNumberInMonth ? `${row.weekNumberInMonth} week` : 'Every week') },
              { key: 'status', header: 'Status', render: (row: WeeklyOffRule) => <Badge variant={row.isActive ? 'success' : 'default'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
              {
                key: 'actions',
                header: 'Actions',
                render: (row: WeeklyOffRule) => (
                  <button onClick={() => deleteWeeklyOffMutation.mutate(row.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Modal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} title="Add Work Location">
        <WorkLocationForm onSubmit={(data) => createLocationMutation.mutate(data)} loading={createLocationMutation.isPending} />
      </Modal>

      <Modal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} title="Add Attendance Policy">
        <AttendancePolicyForm workLocations={workLocations} onSubmit={(data) => createPolicyMutation.mutate(data)} loading={createPolicyMutation.isPending} />
      </Modal>

      <Modal isOpen={showWeeklyOffModal} onClose={() => setShowWeeklyOffModal(false)} title="Add Weekly Off Rule">
        <WeeklyOffRuleForm workLocations={workLocations} onSubmit={(data) => createWeeklyOffMutation.mutate(data)} loading={createWeeklyOffMutation.isPending} />
      </Modal>
    </div>
  );
}

function WorkLocationForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({ name: '', code: '', timeZone: 'Asia/Calcutta', address: '', isActive: true });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ ...form, address: form.address || undefined });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))} required /></div>
      </div>
      <div className="space-y-2"><Label>Timezone</Label><Input value={form.timeZone} onChange={(e) => setForm((c) => ({ ...c, timeZone: e.target.value }))} required /></div>
      <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} /></div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={String(form.isActive)} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.value === 'true' }))}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>
      <div className="flex justify-end"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Location'}</Button></div>
    </form>
  );
}

function AttendancePolicyForm({ workLocations, onSubmit, loading }: { workLocations: WorkLocation[]; onSubmit: (data: any) => void; loading: boolean }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    name: '',
    workLocationId: '',
    standardWorkingHours: 8,
    lateAfterMinutes: 615,
    halfDayAfterMinutes: 780,
    halfDayMinWorkingHours: 4.5,
    graceMinutes: 0,
    overtimeAllowed: true,
    autoAbsentEnabled: false,
    effectiveFrom: today,
    effectiveTo: '',
    isActive: true,
  });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          standardWorkingHours: Number(form.standardWorkingHours),
          lateAfterMinutes: Number(form.lateAfterMinutes),
          halfDayAfterMinutes: Number(form.halfDayAfterMinutes),
          halfDayMinWorkingHours: Number(form.halfDayMinWorkingHours),
          graceMinutes: Number(form.graceMinutes),
          workLocationId: form.workLocationId ? Number(form.workLocationId) : null,
          effectiveTo: form.effectiveTo || undefined,
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required /></div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={form.workLocationId} onChange={(e) => setForm((c) => ({ ...c, workLocationId: e.target.value }))}>
            <option value="">Global</option>
            {workLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Standard Hours</Label><Input type="number" step="0.5" value={form.standardWorkingHours} onChange={(e) => setForm((c) => ({ ...c, standardWorkingHours: Number(e.target.value) }))} required /></div>
        <div className="space-y-2"><Label>Grace Minutes</Label><Input type="number" value={form.graceMinutes} onChange={(e) => setForm((c) => ({ ...c, graceMinutes: Number(e.target.value) }))} required /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Late After</Label><Input type="number" value={form.lateAfterMinutes} onChange={(e) => setForm((c) => ({ ...c, lateAfterMinutes: Number(e.target.value) }))} required /></div>
        <div className="space-y-2"><Label>Half Day After</Label><Input type="number" value={form.halfDayAfterMinutes} onChange={(e) => setForm((c) => ({ ...c, halfDayAfterMinutes: Number(e.target.value) }))} required /></div>
        <div className="space-y-2"><Label>Half Day Min Hours</Label><Input type="number" step="0.5" value={form.halfDayMinWorkingHours} onChange={(e) => setForm((c) => ({ ...c, halfDayMinWorkingHours: Number(e.target.value) }))} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Effective From</Label><Input type="date" value={form.effectiveFrom} onChange={(e) => setForm((c) => ({ ...c, effectiveFrom: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>Effective To</Label><Input type="date" value={form.effectiveTo} onChange={(e) => setForm((c) => ({ ...c, effectiveTo: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Overtime</Label><Select value={String(form.overtimeAllowed)} onChange={(e) => setForm((c) => ({ ...c, overtimeAllowed: e.target.value === 'true' }))}><option value="true">Allowed</option><option value="false">Disabled</option></Select></div>
        <div className="space-y-2"><Label>Auto Absent</Label><Select value={String(form.autoAbsentEnabled)} onChange={(e) => setForm((c) => ({ ...c, autoAbsentEnabled: e.target.value === 'true' }))}><option value="false">Disabled</option><option value="true">Enabled</option></Select></div>
        <div className="space-y-2"><Label>Status</Label><Select value={String(form.isActive)} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.value === 'true' }))}><option value="true">Active</option><option value="false">Inactive</option></Select></div>
      </div>
      <div className="flex justify-end"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Policy'}</Button></div>
    </form>
  );
}

function WeeklyOffRuleForm({ workLocations, onSubmit, loading }: { workLocations: WorkLocation[]; onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    name: '',
    workLocationId: '',
    weekDay: 0,
    weekNumberInMonth: '',
    isActive: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          weekDay: Number(form.weekDay),
          workLocationId: form.workLocationId ? Number(form.workLocationId) : null,
          weekNumberInMonth: form.weekNumberInMonth ? Number(form.weekNumberInMonth) : null,
          effectiveTo: form.effectiveTo || undefined,
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required /></div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={form.workLocationId} onChange={(e) => setForm((c) => ({ ...c, workLocationId: e.target.value }))}>
            <option value="">Global</option>
            {workLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Weekday</Label><Select value={String(form.weekDay)} onChange={(e) => setForm((c) => ({ ...c, weekDay: Number(e.target.value) }))}>{weekDayLabels.map((label, index) => <option key={label} value={index}>{label}</option>)}</Select></div>
        <div className="space-y-2"><Label>Occurrence</Label><Select value={form.weekNumberInMonth} onChange={(e) => setForm((c) => ({ ...c, weekNumberInMonth: e.target.value }))}><option value="">Every week</option><option value="1">1st week</option><option value="2">2nd week</option><option value="3">3rd week</option><option value="4">4th week</option><option value="5">5th week</option></Select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Effective From</Label><Input type="date" value={form.effectiveFrom} onChange={(e) => setForm((c) => ({ ...c, effectiveFrom: e.target.value }))} required /></div>
        <div className="space-y-2"><Label>Effective To</Label><Input type="date" value={form.effectiveTo} onChange={(e) => setForm((c) => ({ ...c, effectiveTo: e.target.value }))} /></div>
      </div>
      <div className="space-y-2"><Label>Status</Label><Select value={String(form.isActive)} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.value === 'true' }))}><option value="true">Active</option><option value="false">Inactive</option></Select></div>
      <div className="flex justify-end"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Weekly Off Rule'}</Button></div>
    </form>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { User, Department, Priority, RoutineFrequency, RoutineWorkItem, RoutineWorkLog } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ListChecks,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  Building,
  User as UserIcon,
  Calendar,
  Clock,
  Printer,
  RotateCcw,
  AlertTriangle,
  Flame,
  Check,
  X,
  Edit,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';

interface RoutineWorkViewProps {
  currentUser: User;
  departments: Department[];
  staffList?: User[];
  onOpenCreateTask?: (prefill?: { title?: string; description?: string; department?: number; priority?: Priority }) => void;
}

const STORAGE_KEY = 'nextup_routine_work_items_v2';
const LOGS_STORAGE_KEY = 'nextup_routine_work_logs_v2';

// Standard institutional templates pre-loaded for Rathinam Group
const INITIAL_ROUTINE_ITEMS: RoutineWorkItem[] = [
  // DAILY CHECKLISTS
  {
    id: 'daily_1',
    title: 'Campus Water Pumps, Overhead Tank Levels & Pressure Check',
    description: 'Check ground sump levels, turn on primary pump, verify overhead tank sensors and pressure meters read at least 2.5 bar across all hostel blocks and academic buildings.',
    frequency: 'DAILY',
    department: 1,
    department_code: 'CIVIL',
    department_name: 'Civil & Facilities',
    assigned_to: 1,
    assigned_to_name: 'Campus Facilities Team',
    priority: 'HIGH',
    target_time: '08:30 AM Daily',
    is_active: true,
  },
  {
    id: 'daily_2',
    title: 'Main Data Center & Server Switch Room Temperature & Network Uplink Check',
    description: 'Inspect rack servers, core switches, server room AC status (must be maintained at 18-21°C), verify primary 1Gbps internet uplink, firewall throughput and UPS battery charge.',
    frequency: 'DAILY',
    department: 2,
    department_code: 'IT',
    department_name: 'IT Services',
    assigned_to: 2,
    assigned_to_name: 'IT Infrastructure Admin',
    priority: 'URGENT',
    target_time: '09:00 AM Daily',
    is_active: true,
  },
  {
    id: 'daily_3',
    title: 'Computer Labs & Smart Classroom Power-up & AV Projector Inspection',
    description: 'Turn on main lab power distribution, test 2 random projectors and audio amplifiers, ensure wireless mic batteries are charged and LAN connections are working for morning lectures.',
    frequency: 'DAILY',
    department: 2,
    department_code: 'IT',
    department_name: 'IT Services',
    assigned_to: 2,
    assigned_to_name: 'Lab Technical Staff',
    priority: 'MEDIUM',
    target_time: '09:15 AM Daily',
    is_active: true,
  },
  {
    id: 'daily_4',
    title: 'Student Hostels Common Area Sanitization & Mess Kitchen Hygiene Audit',
    description: 'Inspect dining hall cleanliness, food storage temperature, RO drinking water coolers, food waste disposal bins, and record dining area hygiene compliance ledger.',
    frequency: 'DAILY',
    department: 3,
    department_code: 'HOSTEL',
    department_name: 'Hostel Administration',
    assigned_to: 3,
    assigned_to_name: 'Hostel Warden',
    priority: 'HIGH',
    target_time: '10:00 AM Daily',
    is_active: true,
  },
  {
    id: 'daily_5',
    title: 'Standby Diesel Generator (DG) Fuel Gauge, Battery & AMF Panel Readiness',
    description: 'Check diesel tank level (must be above 75%), check 24V starter battery terminal voltage, test Auto-Mains Failure (AMF) panel selector switch in auto mode.',
    frequency: 'DAILY',
    department: 4,
    department_code: 'ELEC',
    department_name: 'Electrical Maintenance',
    assigned_to: 4,
    assigned_to_name: 'Electrical Engineer',
    priority: 'URGENT',
    target_time: '04:30 PM Daily',
    is_active: true,
  },
  {
    id: 'daily_6',
    title: 'Campus Perimeter Security Log, CCTV Live Feeds & Night Patrol Handover',
    description: 'Review all 64 CCTV cameras, log visitor vehicles, inspect main entrance and rear gates, handover night patrol walkie-talkies and security ledger.',
    frequency: 'DAILY',
    department: 5,
    department_code: 'ADMIN',
    department_name: 'Campus Security',
    assigned_to: 5,
    assigned_to_name: 'Chief Security Officer',
    priority: 'HIGH',
    target_time: '06:00 PM Daily',
    is_active: true,
  },

  // WEEKLY CHECKLISTS
  {
    id: 'weekly_1',
    title: 'Enterprise Database & Cloud Cold-Storage Automated Backup Verification',
    description: 'Validate integrity of Sunday night database dumps, verify SHA-256 hash checksums, and confirm automated replication to off-site cloud storage bucket.',
    frequency: 'WEEKLY',
    department: 2,
    department_code: 'IT',
    department_name: 'IT Services',
    assigned_to: 2,
    assigned_to_name: 'Database Administrator',
    priority: 'URGENT',
    target_time: 'Every Monday 10:00 AM',
    is_active: true,
  },
  {
    id: 'weekly_2',
    title: 'Campus Central RO Water Purifiers Filter Backwash & TDS Testing',
    description: 'Perform scheduled backwash on dual-media sand and activated carbon filters, measure input & output TDS with digital meter (target: 80-120 PPM), record in maintenance log.',
    frequency: 'WEEKLY',
    department: 1,
    department_code: 'CIVIL',
    department_name: 'Civil & Facilities',
    assigned_to: 1,
    assigned_to_name: 'Water Treatment Supervisor',
    priority: 'HIGH',
    target_time: 'Every Tuesday 11:00 AM',
    is_active: true,
  },
  {
    id: 'weekly_3',
    title: 'College Fleet & Transport Buses Mechanical Safety Inspection',
    description: 'Inspect tire tread depth, brake fluid reservoir, steering play, functional first-aid kits, fire extinguishers, and emergency exit doors across all operational college buses.',
    frequency: 'WEEKLY',
    department: 6,
    department_code: 'TRANS',
    department_name: 'Transport Department',
    assigned_to: 6,
    assigned_to_name: 'Transport Manager',
    priority: 'HIGH',
    target_time: 'Every Wednesday 08:30 AM',
    is_active: true,
  },
  {
    id: 'weekly_4',
    title: 'Academic Chemistry & Engineering Labs Safety Audit & Waste Neutralization',
    description: 'Inspect emergency eyewash stations, acid-fume hoods, chemical neutralization pits, and verify that all volatile reagent bottles are secured with GHS labels.',
    frequency: 'WEEKLY',
    department: 7,
    department_code: 'LABS',
    department_name: 'Academic Labs',
    assigned_to: 7,
    assigned_to_name: 'Lab In-Charge',
    priority: 'MEDIUM',
    target_time: 'Every Thursday 03:00 PM',
    is_active: true,
  },
  {
    id: 'weekly_5',
    title: 'Department Heads Weekly Work Review & Pending Action Items Briefing',
    description: 'Review weekly task completion velocity, audit pending GM approvals, address blockers, and publish aligned priority deliverables for the upcoming academic week.',
    frequency: 'WEEKLY',
    department: 8,
    department_code: 'GM',
    department_name: 'General Management',
    assigned_to: 8,
    assigned_to_name: 'GM Executive Office',
    priority: 'HIGH',
    target_time: 'Every Friday 04:00 PM',
    is_active: true,
  },

  // MONTHLY CHECKLISTS
  {
    id: 'monthly_1',
    title: 'Campus Fire Fighting System, Hydrant Pumps & Extinguisher Pressure Testing',
    description: 'Inspect pressure gauges on all ABC dry powder & CO2 extinguishers, verify automatic starting of main jockey pump upon hydrant valve release, test smoke alarm annunciator panels.',
    frequency: 'MONTHLY',
    department: 5,
    department_code: 'ADMIN',
    department_name: 'Safety & Security',
    assigned_to: 5,
    assigned_to_name: 'Fire Safety Officer',
    priority: 'URGENT',
    target_time: '1st of every month',
    is_active: true,
  },
  {
    id: 'monthly_2',
    title: 'Central Air Conditioning Chillers, Air Handling Units (AHU) & Filter Deep Clean',
    description: 'Wash and deep clean all AHU pre-filters, inspect condenser fans and motor belts, verify refrigerant suction/discharge pressures, grease motor bearings.',
    frequency: 'MONTHLY',
    department: 4,
    department_code: 'ELEC',
    department_name: 'HVAC & Electrical',
    assigned_to: 4,
    assigned_to_name: 'HVAC Specialist',
    priority: 'HIGH',
    target_time: '5th of every month',
    is_active: true,
  },
  {
    id: 'monthly_3',
    title: 'High Tension (HT) Substation Transformer Oil Breakdown Voltage & Earth Pit Test',
    description: 'Measure earth pit resistance with earth tester (must be strictly < 1.0 Ohm), inspect silica gel breather color (blue), record HT transformer primary/secondary voltage logs.',
    frequency: 'MONTHLY',
    department: 4,
    department_code: 'ELEC',
    department_name: 'Electrical Maintenance',
    assigned_to: 4,
    assigned_to_name: 'Senior Electrical Engineer',
    priority: 'URGENT',
    target_time: '10th of every month',
    is_active: true,
  },
  {
    id: 'monthly_4',
    title: 'Institutional Software Licenses, Domain Names & SSL Certificate Expiry Audit',
    description: 'Verify SSL certificate renewal schedules on all college domains and subdomains, audit active Microsoft/Google Workspace educational seat licenses, apply OS security updates.',
    frequency: 'MONTHLY',
    department: 2,
    department_code: 'IT',
    department_name: 'IT Services',
    assigned_to: 2,
    assigned_to_name: 'IT Lead',
    priority: 'HIGH',
    target_time: '15th of every month',
    is_active: true,
  },
  {
    id: 'monthly_5',
    title: 'Departmental Consumables Inventory Audit & Asset Physical Verification',
    description: 'Reconcile stock register with physical stock for office stationery, lab testing kits, maintenance spares, and submit inventory variances to the GM desk.',
    frequency: 'MONTHLY',
    department: 5,
    department_code: 'ADMIN',
    department_name: 'Accounts & Store',
    assigned_to: 5,
    assigned_to_name: 'Store Officer',
    priority: 'MEDIUM',
    target_time: '28th of every month',
    is_active: true,
  },

  // YEARLY CHECKLISTS
  {
    id: 'yearly_1',
    title: 'Annual Laboratory Testing Equipment Calibration & Accuracy Certification',
    description: 'Engage accredited NABL calibration agency to test and certify universal testing machines, digital oscilloscopes, analytical balances, and issue NABL master compliance certificates.',
    frequency: 'YEARLY',
    department: 7,
    department_code: 'LABS',
    department_name: 'Academic Labs',
    assigned_to: 7,
    assigned_to_name: 'Lab Coordinator',
    priority: 'HIGH',
    target_time: 'January Annual Cycle',
    is_active: true,
  },
  {
    id: 'yearly_2',
    title: 'Campus Passenger Lifts & Building Structural Fitness NOC Renewal',
    description: 'Complete annual elevator statutory safety inspection with government electrical inspectorate, renew operating licenses, and verify emergency descent battery backup systems.',
    frequency: 'YEARLY',
    department: 1,
    department_code: 'CIVIL',
    department_name: 'Civil & Facilities',
    assigned_to: 1,
    assigned_to_name: 'Estate Officer',
    priority: 'URGENT',
    target_time: 'April Annual Cycle',
    is_active: true,
  },
  {
    id: 'yearly_3',
    title: 'Internal Quality Assurance Cell (IQAC) NAAC & NBA Annual Compliance Review',
    description: 'Consolidate annual faculty research publications, patents, campus placement statistics, curriculum delivery metrics, and update institutional quality criteria files.',
    frequency: 'YEARLY',
    department: 8,
    department_code: 'GM',
    department_name: 'Quality Assurance Cell',
    assigned_to: 8,
    assigned_to_name: 'IQAC Director',
    priority: 'URGENT',
    target_time: 'June Annual Cycle',
    is_active: true,
  },
  {
    id: 'yearly_4',
    title: 'Comprehensive Campus Infrastructure, Fleet & Student Health Insurance Audit',
    description: 'Review institutional asset valuation, building fire and natural disaster insurance policies, student group accidental cover, and execute annual premium renewal.',
    frequency: 'YEARLY',
    department: 5,
    department_code: 'ADMIN',
    department_name: 'Administration & Legal',
    assigned_to: 5,
    assigned_to_name: 'Administrative Registrar',
    priority: 'HIGH',
    target_time: 'December Annual Cycle',
    is_active: true,
  },
];

// Helper to calculate period identifiers
const getPeriodIdentifier = (frequency: RoutineFrequency): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  switch (frequency) {
    case 'DAILY':
      return `${year}-${month}-${day}`;
    case 'WEEKLY': {
      // ISO week calculation
      const tempDate = new Date(now.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      const weekNumber = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
      return `${year}-W${String(weekNumber).padStart(2, '0')}`;
    }
    case 'MONTHLY':
      return `${year}-${month}`;
    case 'YEARLY':
      return `${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

export const RoutineWorkView: React.FC<RoutineWorkViewProps> = ({
  currentUser,
  departments,
  staffList,
  onOpenCreateTask,
}) => {
  const { isTamil } = useLanguage();

  // Active frequency tab: 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  const [activeFrequency, setActiveFrequency] = useState<string>('DAILY');

  // Filters
  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');
  const [staffFilter, setStaffFilter] = useState<number | 'ALL'>('ALL');
  const [onlyMyTasks, setOnlyMyTasks] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Items and logs loaded from localStorage (or defaults)
  const [items, setItems] = useState<RoutineWorkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ROUTINE_ITEMS;
  });

  const [logs, setLogs] = useState<RoutineWorkLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Save to localStorage whenever items or logs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch {}
  }, [logs]);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutineWorkItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFrequency, setFormFrequency] = useState<RoutineFrequency>('DAILY');
  const [formDept, setFormDept] = useState<number | ''>('');
  const [formAssignee, setFormAssignee] = useState<number | ''>('');
  const [formPriority, setFormPriority] = useState<Priority>('MEDIUM');
  const [formTargetTime, setFormTargetTime] = useState('');

  // Expandable description state
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string | number) => {
    setExpandedItems((prev) => ({ ...prev, [String(id)]: !prev[String(id)] }));
  };

  // Helper to check if an item is completed for its current cycle
  const isItemCompletedCurrentCycle = (item: RoutineWorkItem): { completed: boolean; log?: RoutineWorkLog } => {
    const period = getPeriodIdentifier(item.frequency);
    const foundLog = logs.find((l) => String(l.item_id) === String(item.id) && l.period_identifier === period);
    if (foundLog) {
      return { completed: true, log: foundLog };
    }
    if (item.last_completed_at && item.last_completed_at.startsWith(period)) {
      return { completed: true };
    }
    return { completed: false };
  };

  // Toggle completion
  const handleToggleComplete = (item: RoutineWorkItem) => {
    const period = getPeriodIdentifier(item.frequency);
    const { completed } = isItemCompletedCurrentCycle(item);

    if (completed) {
      // Revert to pending: remove log for this period
      setLogs((prev) => prev.filter((l) => !(String(l.item_id) === String(item.id) && l.period_identifier === period)));
      setItems((prev) =>
        prev.map((i) => {
          if (String(i.id) === String(item.id)) {
            return {
              ...i,
              last_completed_at: null,
              last_completed_by: null,
              last_completed_by_name: undefined,
            };
          }
          return i;
        })
      );
    } else {
      // Mark completed: create new log
      const nowIso = new Date().toISOString();
      const newLog: RoutineWorkLog = {
        id: `log_${Date.now()}`,
        item_id: item.id,
        completed_by: currentUser.id,
        completed_by_name: currentUser.full_name || currentUser.username,
        completed_at: nowIso,
        period_identifier: period,
      };

      setLogs((prev) => [newLog, ...prev]);
      setItems((prev) =>
        prev.map((i) => {
          if (String(i.id) === String(item.id)) {
            return {
              ...i,
              last_completed_at: nowIso,
              last_completed_by: currentUser.id,
              last_completed_by_name: currentUser.full_name || currentUser.username,
            };
          }
          return i;
        })
      );
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = (freq: RoutineFrequency = 'DAILY') => {
    setEditingItem(null);
    setFormTitle('');
    setFormDesc('');
    setFormFrequency(freq);
    setFormDept(currentUser.department || (departments[0]?.id ?? ''));
    setFormAssignee(currentUser.id || '');
    setFormPriority('MEDIUM');
    setFormTargetTime(
      freq === 'DAILY'
        ? '09:00 AM Daily'
        : freq === 'WEEKLY'
        ? 'Every Monday 10:00 AM'
        : freq === 'MONTHLY'
        ? '1st of every month'
        : 'January Annual Cycle'
    );
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: RoutineWorkItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDesc(item.description || '');
    setFormFrequency(item.frequency);
    setFormDept(item.department || '');
    setFormAssignee(item.assigned_to || '');
    setFormPriority(item.priority || 'MEDIUM');
    setFormTargetTime(item.target_time || '');
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const deptObj = departments.find((d) => d.id === Number(formDept));
    const staffObj = staffList?.find((s) => s.id === Number(formAssignee));

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => {
          if (String(i.id) === String(editingItem.id)) {
            return {
              ...i,
              title: formTitle.trim(),
              description: formDesc.trim(),
              frequency: formFrequency,
              department: formDept ? Number(formDept) : null,
              department_name: deptObj?.name || i.department_name,
              department_code: deptObj?.code || i.department_code,
              assigned_to: formAssignee ? Number(formAssignee) : null,
              assigned_to_name: staffObj?.full_name || i.assigned_to_name,
              priority: formPriority,
              target_time: formTargetTime.trim(),
              updated_at: new Date().toISOString(),
            };
          }
          return i;
        })
      );
    } else {
      const newItem: RoutineWorkItem = {
        id: `routine_${Date.now()}`,
        title: formTitle.trim(),
        description: formDesc.trim(),
        frequency: formFrequency,
        department: formDept ? Number(formDept) : null,
        department_name: deptObj?.name,
        department_code: deptObj?.code,
        assigned_to: formAssignee ? Number(formAssignee) : null,
        assigned_to_name: staffObj?.full_name,
        created_by: currentUser.id,
        created_by_name: currentUser.full_name || currentUser.username,
        priority: formPriority,
        target_time: formTargetTime.trim(),
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete item
  const handleDeleteItem = (id: string | number) => {
    if (window.confirm('Are you sure you want to remove this routine checklist item?')) {
      setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
      setLogs((prev) => prev.filter((l) => String(l.item_id) !== String(id)));
    }
  };

  // Log Issue as Task
  const handleLogIssueAsTask = (item: RoutineWorkItem) => {
    if (onOpenCreateTask) {
      onOpenCreateTask({
        title: `[Routine Anomaly]: ${item.title}`,
        description: `⚠️ Issue reported during routine check (${item.frequency.toLowerCase()} cycle):\n\nSOP Reference: ${item.description}\nTarget Schedule: ${item.target_time}\nReported by: ${currentUser.full_name || currentUser.username} on ${new Date().toLocaleDateString()}\n\nDefect Details / Observations:\n`,
        department: item.department || undefined,
        priority: 'HIGH',
      });
    } else {
      alert(`To log this issue as a task, please use the '+ New Task' button at the top and reference: ${item.title}`);
    }
  };

  // Print / Export
  const handlePrint = () => {
    window.print();
  };

  // Reset to default templates
  const handleResetToDefaults = () => {
    if (window.confirm('Reset checklist to standard Rathinam institutional templates? Any custom additions will be refreshed.')) {
      setItems(INITIAL_ROUTINE_ITEMS);
      setLogs([]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LOGS_STORAGE_KEY);
    }
  };

  // Computed Scoped Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Frequency Filter
      if (activeFrequency !== 'ALL' && item.frequency !== activeFrequency) {
        return false;
      }

      // Department Filter
      if (deptFilter !== 'ALL') {
        if (Number(item.department) !== Number(deptFilter)) return false;
      }

      // Staff Filter
      if (staffFilter !== 'ALL') {
        if (Number(item.assigned_to) !== Number(staffFilter)) return false;
      }

      // Assigned to Me
      if (onlyMyTasks) {
        if (Number(item.assigned_to) !== Number(currentUser.id)) return false;
      }

      // Status Filter
      if (statusFilter !== 'ALL') {
        const { completed } = isItemCompletedCurrentCycle(item);
        if (statusFilter === 'COMPLETED' && !completed) return false;
        if (statusFilter === 'PENDING' && completed) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchDept = (item.department_name || item.department_code || '').toLowerCase().includes(q);
        const matchStaff = (item.assigned_to_name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchDept && !matchStaff) return false;
      }

      return true;
    });
  }, [items, logs, activeFrequency, deptFilter, staffFilter, onlyMyTasks, statusFilter, searchQuery, currentUser.id]);

  // Frequency-wise completion stats
  const stats = useMemo(() => {
    const calc = (freq: RoutineFrequency) => {
      const list = items.filter((i) => i.frequency === freq);
      const done = list.filter((i) => isItemCompletedCurrentCycle(i).completed).length;
      return { total: list.length, completed: done, percent: list.length > 0 ? Math.round((done / list.length) * 100) : 0 };
    };

    return {
      DAILY: calc('DAILY'),
      WEEKLY: calc('WEEKLY'),
      MONTHLY: calc('MONTHLY'),
      YEARLY: calc('YEARLY'),
      ALL: {
        total: items.length,
        completed: items.filter((i) => isItemCompletedCurrentCycle(i).completed).length,
      },
    };
  }, [items, logs]);

  const hasActiveFilters = deptFilter !== 'ALL' || staffFilter !== 'ALL' || onlyMyTasks || statusFilter !== 'ALL' || Boolean(searchQuery.trim());

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return <span className="notion-tag tag-red" style={{ fontSize: '10.5px' }}>Urgent</span>;
      case 'HIGH':
        return <span className="notion-tag tag-orange" style={{ fontSize: '10.5px' }}>High</span>;
      case 'MEDIUM':
        return <span className="notion-tag tag-blue" style={{ fontSize: '10.5px' }}>Medium</span>;
      case 'LOW':
      default:
        return <span className="notion-tag tag-gray" style={{ fontSize: '10.5px' }}>Low</span>;
    }
  };

  const getFrequencyBadge = (f: RoutineFrequency) => {
    switch (f) {
      case 'DAILY':
        return (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
            Daily
          </span>
        );
      case 'WEEKLY':
        return (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            Weekly
          </span>
        );
      case 'MONTHLY':
        return (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
            Monthly
          </span>
        );
      case 'YEARLY':
        return (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.14)', color: '#d97706' }}>
            Yearly
          </span>
        );
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1360px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              <ListChecks size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--notion-text)', letterSpacing: '-0.02em' }}>
                {isTamil ? 'வழக்கமான பணி சரிபார்ப்பு பட்டியல்' : 'Routine Work Checklists'}
              </h1>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: 'var(--notion-text-muted)' }}>
                {isTamil
                  ? 'தினசரி, வாராந்திர, மாதாந்திர மற்றும் வருடாந்திர செயல்பாட்டு சரிபார்ப்புகள்'
                  : 'Daily, Weekly, Monthly, and Yearly standard operating procedures (SOP) across institutional departments'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="notion-btn notion-btn-bordered"
            style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '8px', gap: '6px' }}
            title="Print or export checklist report"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="notion-btn notion-btn-bordered"
            style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '8px', gap: '6px', color: 'var(--notion-text-muted)' }}
            title="Reset to default Rathinam checklist templates"
          >
            <RotateCcw size={13} />
            <span>Templates</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal(activeFrequency === 'ALL' ? 'DAILY' : (activeFrequency as RoutineFrequency))}
            className="notion-btn notion-btn-primary"
            style={{
              fontSize: '12.5px',
              padding: '7px 16px',
              borderRadius: '8px',
              gap: '6px',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(35, 131, 226, 0.3)',
            }}
          >
            <Plus size={14} />
            <span>Add Checklist Item</span>
          </button>
        </div>
      </div>

      {/* Progress Cards Across 4 Cycles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Daily Card */}
        <div
          onClick={() => setActiveFrequency('DAILY')}
          style={{
            background: 'var(--notion-card)',
            border: activeFrequency === 'DAILY' ? '2px solid #3b82f6' : '1px solid var(--notion-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            cursor: 'pointer',
            boxShadow: activeFrequency === 'DAILY' ? '0 4px 14px rgba(59, 130, 246, 0.16)' : 'var(--notion-shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>Daily Checklist</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px',
                background: stats.DAILY.percent === 100 ? '#10b981' : 'rgba(59, 130, 246, 0.12)',
                color: stats.DAILY.percent === 100 ? '#ffffff' : '#2563eb',
              }}
            >
              {stats.DAILY.percent}% Done
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800, color: 'var(--notion-text)' }}>
            {stats.DAILY.completed} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--notion-text-muted)' }}>/ {stats.DAILY.total} Today</span>
          </div>
          <div style={{ marginTop: '8px', height: '5px', borderRadius: '4px', background: 'var(--notion-item-bg)', overflow: 'hidden' }}>
            <div style={{ width: `${stats.DAILY.percent}%`, height: '100%', background: '#3b82f6', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Weekly Card */}
        <div
          onClick={() => setActiveFrequency('WEEKLY')}
          style={{
            background: 'var(--notion-card)',
            border: activeFrequency === 'WEEKLY' ? '2px solid #10b981' : '1px solid var(--notion-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            cursor: 'pointer',
            boxShadow: activeFrequency === 'WEEKLY' ? '0 4px 14px rgba(16, 185, 129, 0.16)' : 'var(--notion-shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>Weekly Checklist</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px',
                background: stats.WEEKLY.percent === 100 ? '#10b981' : 'rgba(16, 185, 129, 0.12)',
                color: stats.WEEKLY.percent === 100 ? '#ffffff' : '#059669',
              }}
            >
              {stats.WEEKLY.percent}% Done
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800, color: 'var(--notion-text)' }}>
            {stats.WEEKLY.completed} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--notion-text-muted)' }}>/ {stats.WEEKLY.total} This Week</span>
          </div>
          <div style={{ marginTop: '8px', height: '5px', borderRadius: '4px', background: 'var(--notion-item-bg)', overflow: 'hidden' }}>
            <div style={{ width: `${stats.WEEKLY.percent}%`, height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Monthly Card */}
        <div
          onClick={() => setActiveFrequency('MONTHLY')}
          style={{
            background: 'var(--notion-card)',
            border: activeFrequency === 'MONTHLY' ? '2px solid #8b5cf6' : '1px solid var(--notion-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            cursor: 'pointer',
            boxShadow: activeFrequency === 'MONTHLY' ? '0 4px 14px rgba(139, 92, 246, 0.16)' : 'var(--notion-shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed' }}>Monthly Checklist</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px',
                background: stats.MONTHLY.percent === 100 ? '#10b981' : 'rgba(139, 92, 246, 0.12)',
                color: stats.MONTHLY.percent === 100 ? '#ffffff' : '#7c3aed',
              }}
            >
              {stats.MONTHLY.percent}% Done
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800, color: 'var(--notion-text)' }}>
            {stats.MONTHLY.completed} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--notion-text-muted)' }}>/ {stats.MONTHLY.total} This Month</span>
          </div>
          <div style={{ marginTop: '8px', height: '5px', borderRadius: '4px', background: 'var(--notion-item-bg)', overflow: 'hidden' }}>
            <div style={{ width: `${stats.MONTHLY.percent}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Yearly Card */}
        <div
          onClick={() => setActiveFrequency('YEARLY')}
          style={{
            background: 'var(--notion-card)',
            border: activeFrequency === 'YEARLY' ? '2px solid #f59e0b' : '1px solid var(--notion-border)',
            borderRadius: '12px',
            padding: '14px 18px',
            cursor: 'pointer',
            boxShadow: activeFrequency === 'YEARLY' ? '0 4px 14px rgba(245, 158, 11, 0.16)' : 'var(--notion-shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>Yearly Checklist</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px',
                background: stats.YEARLY.percent === 100 ? '#10b981' : 'rgba(245, 158, 11, 0.14)',
                color: stats.YEARLY.percent === 100 ? '#ffffff' : '#d97706',
              }}
            >
              {stats.YEARLY.percent}% Done
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800, color: 'var(--notion-text)' }}>
            {stats.YEARLY.completed} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--notion-text-muted)' }}>/ {stats.YEARLY.total} This Year</span>
          </div>
          <div style={{ marginTop: '8px', height: '5px', borderRadius: '4px', background: 'var(--notion-item-bg)', overflow: 'hidden' }}>
            <div style={{ width: `${stats.YEARLY.percent}%`, height: '100%', background: '#f59e0b', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div
        style={{
          background: 'var(--notion-card)',
          border: '1px solid var(--notion-border)',
          borderRadius: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          marginBottom: '18px',
          overflow: 'hidden',
        }}
      >
        {/* ROW 1: Frequency Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'rgba(248, 250, 252, 0.7)',
            borderBottom: '1px solid var(--notion-border-subtle)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'DAILY', label: '📅 Daily Checklist', count: stats.DAILY.total, activeColor: '#2563eb', activeBg: 'rgba(59, 130, 246, 0.14)' },
            { id: 'WEEKLY', label: '🗓️ Weekly Checklist', count: stats.WEEKLY.total, activeColor: '#059669', activeBg: 'rgba(16, 185, 129, 0.14)' },
            { id: 'MONTHLY', label: '📆 Monthly Checklist', count: stats.MONTHLY.total, activeColor: '#7c3aed', activeBg: 'rgba(139, 92, 246, 0.14)' },
            { id: 'YEARLY', label: '🏆 Yearly Checklist', count: stats.YEARLY.total, activeColor: '#d97706', activeBg: 'rgba(245, 158, 11, 0.16)' },
            { id: 'ALL', label: '📊 All Frequencies', count: stats.ALL.total, activeColor: '#4f46e5', activeBg: 'rgba(99, 102, 241, 0.14)' },
          ].map((tab) => {
            const isActive = activeFrequency === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFrequency(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: isActive ? `1.5px solid ${tab.activeColor}` : '1px solid transparent',
                  background: isActive ? tab.activeBg : 'transparent',
                  color: isActive ? tab.activeColor : 'var(--notion-text-muted)',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isActive ? tab.activeColor : 'rgba(0, 0, 0, 0.06)',
                    color: isActive ? '#ffffff' : 'var(--notion-text-muted)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: Contextual Filters (Department, Staff, Status, Search) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Left: Department & Staff */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Assigned to Me */}
            <button
              type="button"
              onClick={() => setOnlyMyTasks(!onlyMyTasks)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: onlyMyTasks ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'var(--notion-card)',
                color: onlyMyTasks ? '#ffffff' : 'var(--notion-text)',
                border: onlyMyTasks ? '1px solid transparent' : '1px solid var(--notion-border)',
                boxShadow: onlyMyTasks ? '0 2px 6px rgba(79, 70, 229, 0.28)' : 'var(--notion-shadow-sm)',
              }}
            >
              <CheckCircle2 size={13} />
              <span>Assigned to Me</span>
            </button>

            {/* Department Dropdown */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '8px',
                background: deptFilter !== 'ALL' ? 'rgba(124, 58, 237, 0.09)' : 'var(--notion-card)',
                border: deptFilter !== 'ALL' ? '1.5px solid #8b5cf6' : '1px solid var(--notion-border)',
              }}
            >
              <Building size={12} style={{ color: deptFilter !== 'ALL' ? '#7c3aed' : 'var(--notion-text-muted)' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: deptFilter !== 'ALL' ? '#7c3aed' : 'var(--notion-text-muted)' }}>Dept:</span>
              <select
                value={String(deptFilter)}
                onChange={(e) => setDeptFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '11.5px',
                  fontWeight: deptFilter !== 'ALL' ? 700 : 500,
                  color: deptFilter !== 'ALL' ? '#7c3aed' : 'var(--notion-text)',
                  cursor: 'pointer',
                  maxWidth: '160px',
                }}
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              {deptFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setDeptFilter('ALL')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: '11px', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Staff Dropdown */}
            {staffList && staffList.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  background: staffFilter !== 'ALL' ? 'rgba(35, 131, 226, 0.09)' : 'var(--notion-card)',
                  border: staffFilter !== 'ALL' ? '1.5px solid var(--notion-blue)' : '1px solid var(--notion-border)',
                }}
              >
                <UserIcon size={12} style={{ color: staffFilter !== 'ALL' ? 'var(--notion-blue)' : 'var(--notion-text-muted)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: staffFilter !== 'ALL' ? 'var(--notion-blue)' : 'var(--notion-text-muted)' }}>Staff:</span>
                <select
                  value={String(staffFilter)}
                  onChange={(e) => setStaffFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '11.5px',
                    fontWeight: staffFilter !== 'ALL' ? 700 : 500,
                    color: staffFilter !== 'ALL' ? 'var(--notion-blue)' : 'var(--notion-text)',
                    cursor: 'pointer',
                    maxWidth: '160px',
                  }}
                >
                  <option value="ALL">All Personnel</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.username}
                    </option>
                  ))}
                </select>
                {staffFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setStaffFilter('ALL')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--notion-blue)', fontSize: '11px', padding: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {(['ALL', 'PENDING', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    fontSize: '11px',
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: statusFilter === st ? '1px solid var(--notion-border)' : '1px solid transparent',
                    background: statusFilter === st ? 'var(--notion-item-bg)' : 'transparent',
                    color: statusFilter === st ? 'var(--notion-text)' : 'var(--notion-text-muted)',
                    fontWeight: statusFilter === st ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {st === 'ALL' ? 'All' : st === 'PENDING' ? '⏳ Pending' : '✓ Completed'}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setDeptFilter('ALL');
                  setStaffFilter('ALL');
                  setOnlyMyTasks(false);
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  cursor: 'pointer',
                }}
              >
                <X size={11} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Right: Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              background: 'var(--notion-item-bg)',
              border: '1px solid var(--notion-border)',
              borderRadius: '8px',
              width: '210px',
            }}
          >
            <Search size={12} style={{ color: 'var(--notion-text-muted)' }} />
            <input
              type="text"
              placeholder="Search checklist or SOP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '11.5px',
                width: '100%',
                color: 'var(--notion-text)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--notion-text-muted)', padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Checklist Items Container */}
      <div
        style={{
          border: '1px solid var(--notion-border)',
          borderRadius: '12px',
          background: 'var(--notion-card)',
          overflow: 'hidden',
          boxShadow: 'var(--notion-shadow-sm)',
        }}
      >
        {filteredItems.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--notion-text-muted)' }}>
            <ListChecks size={28} style={{ opacity: 0.35, marginBottom: '8px' }} />
            <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600 }}>No checklist items match the selected filter</p>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--notion-text-dim)' }}>
              Try changing the frequency tab or resetting the department/status filters.
            </p>
            <button
              type="button"
              onClick={() => handleOpenCreateModal(activeFrequency === 'ALL' ? 'DAILY' : (activeFrequency as RoutineFrequency))}
              className="notion-btn notion-btn-primary"
              style={{ fontSize: '11.5px', padding: '6px 14px' }}
            >
              <Plus size={12} />
              <span>Add Checklist Item</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const { completed, log } = isItemCompletedCurrentCycle(item);
            const isExpanded = Boolean(expandedItems[String(item.id)]);

            return (
              <div
                key={item.id}
                style={{
                  borderBottom: '1px solid var(--notion-border-subtle)',
                  padding: '12px 18px',
                  background: completed ? 'rgba(240, 253, 244, 0.5)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                  {/* Left: Checkbox + Title + Attributes */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(item)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: completed ? '#10b981' : 'var(--notion-border-dark, #cbd5e1)',
                        transition: 'color 0.15s ease, transform 0.1s ease',
                      }}
                      title={completed ? 'Click to mark pending' : 'Click to mark completed for this cycle'}
                    >
                      {completed ? (
                        <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      ) : (
                        <Circle size={20} style={{ color: '#94a3b8' }} />
                      )}
                    </button>

                    {/* Title & Metadata */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: completed ? 'var(--notion-text-dim)' : 'var(--notion-text)',
                            textDecoration: completed ? 'line-through' : 'none',
                          }}
                        >
                          {item.title}
                        </span>

                        {getFrequencyBadge(item.frequency)}

                        {item.department_code && (
                          <span className="notion-tag tag-purple" style={{ fontSize: '10.5px' }}>
                            {item.department_code}
                          </span>
                        )}

                        {getPriorityBadge(item.priority)}

                        {item.target_time && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: 'var(--notion-text-muted)',
                              background: 'var(--notion-item-bg)',
                              padding: '1px 6px',
                              borderRadius: '6px',
                            }}
                          >
                            <Clock size={11} />
                            {item.target_time}
                          </span>
                        )}
                      </div>

                      {/* Completed Attribution Bar */}
                      {completed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                          <ShieldCheck size={13} />
                          <span>
                            Completed for current {item.frequency.toLowerCase()} cycle by{' '}
                            <strong>{log?.completed_by_name || item.last_completed_by_name || 'Staff'}</strong>
                            {log?.completed_at ? ` at ${new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                          </span>
                        </div>
                      )}

                      {/* SOP Instructions Accordion */}
                      {item.description && (
                        <div style={{ marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11.5px',
                              color: 'var(--notion-text-muted)',
                              fontWeight: 600,
                            }}
                          >
                            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                            <span>Standard Operating Procedure (SOP)</span>
                          </button>

                          {isExpanded && (
                            <div
                              style={{
                                marginTop: '6px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: 'var(--notion-item-bg)',
                                fontSize: '12px',
                                color: 'var(--notion-text)',
                                lineHeight: '1.5',
                                borderLeft: '3px solid var(--notion-blue)',
                              }}
                            >
                              {item.description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Log Anomaly as Task Button */}
                    <button
                      type="button"
                      onClick={() => handleLogIssueAsTask(item)}
                      className="notion-btn notion-btn-bordered"
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        gap: '4px',
                        color: '#d97706',
                        borderColor: 'rgba(245, 158, 11, 0.4)',
                        background: 'rgba(245, 158, 11, 0.08)',
                      }}
                      title="If a problem or defect was found during this check, convert it to an Action Task"
                    >
                      <AlertTriangle size={11} />
                      <span>Log Issue</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--notion-text-muted)',
                        padding: '4px',
                      }}
                      title="Edit checklist item"
                    >
                      <Edit size={13} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '4px',
                      }}
                      title="Delete checklist item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Add / Edit Routine Checklist Item */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--notion-card)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              border: '1px solid var(--notion-border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--notion-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListChecks size={18} style={{ color: 'var(--notion-blue)' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--notion-text)' }}>
                  {editingItem ? 'Edit Routine Checklist Item' : 'New Routine Checklist Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--notion-text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ padding: '20px' }}>
              {/* Title */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--notion-text)' }}>
                  Checklist Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect Campus Water Pumps & Pressure"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--notion-border)',
                    background: 'var(--notion-item-bg)',
                    color: 'var(--notion-text)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Frequency & Priority Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--notion-text)' }}>
                    Checklist Frequency *
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as RoutineFrequency)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--notion-border)',
                      background: 'var(--notion-item-bg)',
                      color: 'var(--notion-text)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="DAILY">📅 Daily Checklist</option>
                    <option value="WEEKLY">🗓️ Weekly Checklist</option>
                    <option value="MONTHLY">📆 Monthly Checklist</option>
                    <option value="YEARLY">🏆 Yearly Checklist</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--notion-text)' }}>
                    Priority *
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--notion-border)',
                      background: 'var(--notion-item-bg)',
                      color: 'var(--notion-text)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Department & Assignee Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--notion-text)' }}>
                    Department
                  </label>
                  <select
                    value={String(formDept)}
                    onChange={(e) => setFormDept(e.target.value ? Number(e.target.value) : '')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--notion-border)',
                      background: 'var(--notion-item-bg)',
                      color: 'var(--notion-text)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--notion-text)' }}>
                    Assigned Personnel
                  </label>
                  <select
                    value={String(formAssignee)}
                    onChange={(e) => setFormAssignee(e.target.value ? Number(e.target.value) : '')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--notion-border)',
                      background: 'var(--notion-item-bg)',
                      color: 'var(--notion-text)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select Staff</option>
                    {staffList?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Schedule */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--notion-text)' }}>
                  Target Schedule (e.g. 09:30 AM Daily, Every Monday, 1st of month)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM Daily"
                  value={formTargetTime}
                  onChange={(e) => setFormTargetTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--notion-border)',
                    background: 'var(--notion-item-bg)',
                    color: 'var(--notion-text)',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* SOP / Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--notion-text)' }}>
                  Standard Operating Procedure (SOP) / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed inspection procedure, parameters to verify, and threshold values..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--notion-border)',
                    background: 'var(--notion-item-bg)',
                    color: 'var(--notion-text)',
                    fontSize: '12.5px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="notion-btn notion-btn-bordered"
                  style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="notion-btn notion-btn-primary"
                  style={{ fontSize: '12px', padding: '7px 18px', borderRadius: '8px', fontWeight: 700 }}
                >
                  {editingItem ? 'Save Changes' : 'Create Checklist Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


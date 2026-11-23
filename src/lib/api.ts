const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    let msg = data?.error || data?.message || data?.detail;
    if (!msg && typeof data === 'object' && data !== null) {
      const firstVal = Object.values(data)[0];
      if (Array.isArray(firstVal) && firstVal.length > 0) {
        msg = String(firstVal[0]);
      } else if (typeof firstVal === 'string') {
        msg = firstVal;
      }
    }
    super(msg || (typeof data === 'string' && data.length < 200 ? data : `Request failed with status ${status}`));
    this.status = status;
    this.data = data;
  }
}

export function getTokens(): { access: string | null; refresh: string | null } {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  return {
    access: localStorage.getItem('seyal_access_token'),
    refresh: localStorage.getItem('seyal_refresh_token'),
  };
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('seyal_access_token', access);
  localStorage.setItem('seyal_refresh_token', refresh);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('seyal_access_token');
  localStorage.removeItem('seyal_refresh_token');
  localStorage.removeItem('seyal_user');
  localStorage.removeItem('seyal_current_ws');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { access } = getTokens();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (access && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${access}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    // Optional: try refresh token if present
    const { refresh } = getTokens();
    if (refresh && !endpoint.includes('refresh') && !endpoint.includes('login')) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
        if (refreshRes.ok) {
          const tokenData = await refreshRes.json();
          setTokens(tokenData.access, refresh);
          headers.set('Authorization', `Bearer ${tokenData.access}`);
          const retryRes = await fetch(url, { ...options, headers });
          if (!retryRes.ok) throw new Error();
          return retryRes.json();
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    } else if (!endpoint.includes('login')) {
      clearTokens();
    }
  }

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

// ----------------- API Methods ----------------- //

export const api = {
  // Auth
  register: (payload: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role?: string;
    account_type?: string;
    organization_name?: string;
  }) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  socialAuth: (provider: 'google' | 'facebook' | 'apple', payload: any) =>
    apiRequest(`/auth/social/${provider}`, { method: 'POST', body: JSON.stringify(payload) }),

  requestOtp: (target: string | { phone?: string; email?: string; provider?: string; purpose?: string }) => {
    const body = typeof target === 'string'
      ? (target.includes('@') ? { email: target } : { phone: target })
      : target;
    return apiRequest('/auth/otp/request', { method: 'POST', body: JSON.stringify(body) });
  },

  verifyOtp: (payload: {
    phone?: string;
    email?: string;
    code: string;
    name?: string;
    provider?: string;
    password?: string;
    subdivision?: string;
    organization_name?: string;
    role?: string;
  }) =>
    apiRequest('/auth/otp/verify', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: () => apiRequest('/me'),

  updateMe: (data: any) => apiRequest('/me', { method: 'PATCH', body: JSON.stringify(data) }),

  chooseOnboarding: (payload: { mode: 'myself' | 'team' | 'join'; team_name?: string; invite_token?: string }) =>
    apiRequest('/onboarding/usage', { method: 'POST', body: JSON.stringify(payload) }),

  getIdentities: () => apiRequest('/auth/identities'),
  deleteIdentity: (id: string) => apiRequest(`/auth/identities/${id}`, { method: 'DELETE' }),

  // Workspaces
  getWorkspaces: () => apiRequest('/workspaces'),
  getWorkspace: (id: string) => apiRequest(`/workspaces/${id}`),
  createWorkspace: (data: { name: string; type?: string; plan?: string; settings?: any }) =>
    apiRequest('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkspace: (id: string, data: any) =>
    apiRequest(`/workspaces/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWorkspace: (id: string) => apiRequest(`/workspaces/${id}`, { method: 'DELETE' }),
  convertWorkspace: (id: string) =>
    apiRequest(`/workspaces/${id}/convert`, { method: 'POST' }),

  // Workspace Members & Departments
  getWorkspaceMembers: (workspaceId: string) =>
    apiRequest(`/workspaces/${workspaceId}/members`),
  addWorkspaceMember: (workspaceId: string, payload: { user_id: string; role: string }) =>
    apiRequest(`/workspaces/${workspaceId}/members`, { method: 'POST', body: JSON.stringify(payload) }),
  updateMember: (memberId: string, payload: { role?: string; status?: string }) =>
    apiRequest(`/members/${memberId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  removeMember: (memberId: string) =>
    apiRequest(`/members/${memberId}`, { method: 'DELETE' }),

  getDepartments: (workspaceId: string) =>
    apiRequest(`/workspaces/${workspaceId}/departments`),
  createDepartment: (workspaceId: string, payload: { name: string; manager_id?: string | null }) =>
    apiRequest(`/workspaces/${workspaceId}/departments`, { method: 'POST', body: JSON.stringify(payload) }),
  updateDepartment: (deptId: string, payload: any) =>
    apiRequest(`/departments/${deptId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteDepartment: (deptId: string) =>
    apiRequest(`/departments/${deptId}`, { method: 'DELETE' }),

  inviteMember: (workspaceId: string, payload: { email_or_phone: string; role: string }) =>
    apiRequest(`/workspaces/${workspaceId}/invites`, { method: 'POST', body: JSON.stringify(payload) }),
  acceptInvite: (token: string) =>
    apiRequest(`/invites/${token}/accept`, { method: 'POST' }),

  // Content (Pages & Blocks)
  getPages: (workspaceId: string, params?: { parent_page_id?: string; is_favorite?: boolean }) => {
    const q = new URLSearchParams({ workspace_id: workspaceId });
    if (params?.parent_page_id) q.set('parent_page_id', params.parent_page_id);
    if (params?.is_favorite !== undefined) q.set('is_favorite', String(params.is_favorite));
    return apiRequest(`/pages?${q.toString()}`);
  },
  createPage: (payload: { workspace_id: string; title?: string; icon?: string; parent_page_id?: string | null }) =>
    apiRequest('/pages', { method: 'POST', body: JSON.stringify(payload) }),
  getPage: (id: string) => apiRequest(`/pages/${id}`),
  updatePage: (id: string, data: any) =>
    apiRequest(`/pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePage: (id: string) => apiRequest(`/pages/${id}`, { method: 'DELETE' }),

  getBlocks: (pageId: string) => apiRequest(`/pages/${pageId}/blocks`),
  addBlock: (pageId: string, payload: { type: string; content?: any; prev_pos?: number; next_pos?: number }) =>
    apiRequest(`/pages/${pageId}/blocks`, { method: 'POST', body: JSON.stringify(payload) }),
  batchUpdateBlocks: (pageId: string, blocks: any[]) =>
    apiRequest(`/pages/${pageId}/blocks/batch`, { method: 'POST', body: JSON.stringify({ blocks }) }),
  updateBlock: (blockId: string, data: any) =>
    apiRequest(`/blocks/${blockId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBlock: (blockId: string) => apiRequest(`/blocks/${blockId}`, { method: 'DELETE' }),

  // Databases & Views
  getDatabases: (workspaceId: string) =>
    apiRequest(`/databases?workspace_id=${workspaceId}`),
  createDatabase: (payload: { workspace_id: string; page_id?: string | null; name: string; schema?: any }) =>
    apiRequest('/databases', { method: 'POST', body: JSON.stringify(payload) }),
  getDatabase: (id: string) => apiRequest(`/databases/${id}`),
  getDatabaseRows: (databaseId: string) => apiRequest(`/databases/${databaseId}/rows`),
  createDatabaseRow: (databaseId: string, properties: any) =>
    apiRequest(`/databases/${databaseId}/rows`, { method: 'POST', body: JSON.stringify({ properties }) }),
  updateDatabaseRow: (rowId: string, properties: any) =>
    apiRequest(`/rows/${rowId}`, { method: 'PATCH', body: JSON.stringify({ properties }) }),
  deleteDatabaseRow: (rowId: string) => apiRequest(`/rows/${rowId}`, { method: 'DELETE' }),

  // Tasks & Hierarchy Workflow
  getTasks: (workspaceId: string, filters?: { department_id?: string; assignee_id?: string; status?: string; priority?: string }) => {
    const q = new URLSearchParams({ workspace_id: workspaceId });
    if (filters?.department_id) q.set('department_id', filters.department_id);
    if (filters?.assignee_id) q.set('assignee_id', filters.assignee_id);
    if (filters?.status) q.set('status', filters.status);
    if (filters?.priority) q.set('priority', filters.priority);
    return apiRequest(`/tasks?${q.toString()}`);
  },
  createTask: (payload: any) => apiRequest('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  getTask: (id: string) => apiRequest(`/tasks/${id}`),
  updateTask: (id: string, data: any) =>
    apiRequest(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),

  submitTask: (taskId: string, payload: { note?: string; attachments?: any[] }) =>
    apiRequest(`/tasks/${taskId}/submit`, { method: 'POST', body: JSON.stringify(payload) }),

  reviewTask: (taskId: string, payload: { decision: 'approve' | 'reject'; review_note?: string }) =>
    apiRequest(`/tasks/${taskId}/review`, { method: 'POST', body: JSON.stringify(payload) }),

  getMyTasks: () => apiRequest('/me/tasks'),
  getTaskComments: (taskId: string) => apiRequest(`/tasks/${taskId}/comments`),
  addTaskComment: (taskId: string, body: string) =>
    apiRequest(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'POST' }),
  getActivityLog: (workspaceId: string) => apiRequest(`/workspaces/${workspaceId}/activities`),

  // Search & Reports
  searchGlobal: (query: string, workspaceId?: string) => {
    const q = new URLSearchParams({ q: query });
    if (workspaceId) q.set('workspace_id', workspaceId);
    return apiRequest(`/search?${q.toString()}`);
  },
  getDepartmentReport: (workspaceId: string) =>
    apiRequest(`/reports/department?workspace_id=${workspaceId}`),
  getMemberReport: (workspaceId: string) =>
    apiRequest(`/reports/members?workspace_id=${workspaceId}`),

  // Billing
  getPlans: () => apiRequest('/plans'),
  getSubscription: (workspaceId: string) =>
    apiRequest(`/workspaces/${workspaceId}/subscription`),
  createOrder: (workspaceId: string, payload: { plan_slug: string; billing_cycle?: 'monthly' | 'yearly' }) =>
    apiRequest(`/workspaces/${workspaceId}/create-order`, { method: 'POST', body: JSON.stringify(payload) }),
  confirmPayment: (workspaceId: string, payload: any) =>
    apiRequest(`/workspaces/${workspaceId}/confirm-payment`, { method: 'POST', body: JSON.stringify(payload) }),

  // Integrations: Google Drive & Gmail
  getGoogleDriveFiles: (query?: string) => {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiRequest(`/integrations/google/drive${q}`);
  },
  getGmailMessages: (query?: string) => {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiRequest(`/integrations/google/gmail${q}`);
  },
  createTaskFromEmail: (payload: { workspace_id: string; subject: string; body?: string; from_name?: string; from_email?: string; priority?: string; department_id?: string; due_date?: string }) =>
    apiRequest('/integrations/google/gmail/create-task', { method: 'POST', body: JSON.stringify(payload) }),

  // AI Assistant: Anthropic Claude
  generateWithClaude: (payload: { prompt: string; mode?: 'chat' | 'draft' | 'summarize' | 'breakdown'; context?: string; api_key?: string }) =>
    apiRequest('/ai/claude/generate', { method: 'POST', body: JSON.stringify(payload) }),

  // Birthday & Occasion Reminders
  getBirthdays: (query?: string) => {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiRequest(`/reminders/birthdays${q}`);
  },
  addBirthday: (payload: { name: string; birth_date: string; relationship?: string; department?: string; phone?: string; email?: string; gift_ideas?: string; notes?: string }) =>
    apiRequest('/reminders/birthdays', { method: 'POST', body: JSON.stringify(payload) }),
  deleteBirthday: (id: string) =>
    apiRequest(`/reminders/birthdays/${id}`, { method: 'DELETE' }),

  // API Keys & External Integrations Settings
  getIntegrationSettings: (workspaceId?: string) => {
    const q = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : '';
    return apiRequest(`/integrations/settings${q}`);
  },
  updateIntegrationSettings: (payload: {
    workspace_id?: string;
    anthropic_api_key?: string;
    anthropic_model?: string;
    google_client_id?: string;
    google_client_secret?: string;
    google_api_key?: string;
    razorpay_key_id?: string;
    razorpay_key_secret?: string;
    razorpay_mode?: string;
  }) => apiRequest('/integrations/settings', { method: 'POST', body: JSON.stringify(payload) }),
  testIntegrationConnection: (payload: {
    provider: 'claude' | 'google' | 'razorpay';
    workspace_id?: string;
    api_key?: string;
    client_id?: string;
    key_id?: string;
  }) => apiRequest('/integrations/test', { method: 'POST', body: JSON.stringify(payload) }),

  // Subdivisions (Organisation, Personal, Freelancer, Customize)
  getSubdivisions: () => apiRequest('/subdivisions'),

  // Superadmin (Product Owner)
  getSuperadminAnalytics: () => apiRequest('/superadmin/analytics'),
  getSuperadminOrganisations: () => apiRequest('/superadmin/organisations'),
  createSuperadminOrganisation: (payload: any) =>
    apiRequest('/superadmin/organisations', { method: 'POST', body: JSON.stringify(payload) }),
  updateSuperadminOrganisation: (id: string, payload: any) =>
    apiRequest(`/superadmin/organisations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getSuperadminUsers: () => apiRequest('/superadmin/users'),
  createSuperadminUser: (payload: any) =>
    apiRequest('/superadmin/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateSuperadminUser: (id: string, payload: any) =>
    apiRequest(`/superadmin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteSuperadminUser: (id: string) =>
    apiRequest(`/superadmin/users/${id}`, { method: 'DELETE' }),

  // Organisation Subdivision
  getOrgOverview: (orgId: string) => apiRequest(`/organisations/${orgId}/overview`),
  getOrgProjects: (orgId: string, filters?: { onboarding?: string; lifecycle?: string }) => {
    const q = new URLSearchParams();
    if (filters?.onboarding) q.set('onboarding', filters.onboarding);
    if (filters?.lifecycle) q.set('lifecycle', filters.lifecycle);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest(`/organisations/${orgId}/projects${qs}`);
  },
  createOrgProject: (orgId: string, payload: any) =>
    apiRequest(`/organisations/${orgId}/projects`, { method: 'POST', body: JSON.stringify(payload) }),
  getProject: (projectId: string) => apiRequest(`/projects/${projectId}`),
  updateProject: (projectId: string, payload: any) =>
    apiRequest(`/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getOrgUsers: (orgId: string) => apiRequest(`/organisations/${orgId}/users`),
  createOrgUser: (orgId: string, payload: any) =>
    apiRequest(`/organisations/${orgId}/users`, { method: 'POST', body: JSON.stringify(payload) }),
  getOrgReports: (orgId: string) => apiRequest(`/organisations/${orgId}/reports`),
};


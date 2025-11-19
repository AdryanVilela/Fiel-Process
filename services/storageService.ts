import { Process } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'processflow_data_v1';
const USERS_KEY = 'processflow_users_v1';

const SAMPLE_PROCESS: Process = {
  id: 'sample-1',
  title: 'Onboarding de Novos Funcionários',
  description: 'Guia passo-a-passo para integração de novos membros da equipe de desenvolvimento.',
  category: 'RH',
  tags: ['onboarding', 'rh', 'dev'],
  lastUpdated: Date.now(),
  isFavorite: true,
  shareSettings: {
    visibility: 'private',
    role: 'viewer'
  },
  blocks: [
    {
      id: 'b1',
      type: 'text',
      content: 'Bem-vindo ao time! Este processo guia você pelas etapas essenciais do seu primeiro dia.'
    },
    {
      id: 'b2',
      type: 'checklist',
      content: '',
      checklistItems: [
        { id: 'c1', text: 'Configurar conta de e-mail corporativo', checked: true },
        { id: 'c2', text: 'Acessar o Slack da empresa', checked: false },
        { id: 'c3', text: 'Clonar repositórios do GitHub', checked: false }
      ]
    },
    {
      id: 'b3',
      type: 'image',
      content: 'https://picsum.photos/800/400'
    },
    {
      id: 'b4',
      type: 'text',
      content: 'Certifique-se de assistir ao vídeo de cultura da empresa abaixo:'
    }
  ]
};

export const getProcesses = (): Process[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Initialize with sample data
    localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_PROCESS]));
    return [SAMPLE_PROCESS];
  }
  return JSON.parse(data);
};

export const saveProcess = (process: Process): void => {
  const processes = getProcesses();
  const index = processes.findIndex(p => p.id === process.id);
  
  if (index >= 0) {
    processes[index] = { ...process, lastUpdated: Date.now() };
  } else {
    processes.push({ ...process, lastUpdated: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
};

export const deleteProcess = (id: string): void => {
  const processes = getProcesses();
  const filtered = processes.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const toggleFavorite = (id: string): void => {
  const processes = getProcesses();
  const target = processes.find(p => p.id === id);
  if (target) {
    target.isFavorite = !target.isFavorite;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
  }
};

export const generateId = (): string => {
  return uuidv4();
};

// User Management System
export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // In a real app, this would be hashed
}

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const registerUser = (user: Omit<User, 'id'>): { success: boolean; message?: string; user?: User } => {
  const users = getUsers();
  
  if (users.some(u => u.email === user.email)) {
    return { success: false, message: 'Este e-mail já está cadastrado.' };
  }

  const newUser = { ...user, id: generateId() };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  return { success: true, user: newUser };
};

export const updateUser = (updatedUser: User): { success: boolean; message?: string } => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);

  if (index === -1) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  // Check if email change conflicts with another user
  if (users.some(u => u.email === updatedUser.email && u.id !== updatedUser.id)) {
    return { success: false, message: 'Este e-mail já está sendo usado por outro usuário.' };
  }

  users[index] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  return { success: true };
};

export const loginUser = (email: string, password: string): { success: boolean; message?: string; user?: User } => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    // Demo fallback for testing if no users exist or special demo credentials
    if (users.length === 0 && password.length >= 6) {
       return { success: true, user: { id: 'demo', email, name: 'Usuário Demo', password } };
    }
    return { success: false, message: 'E-mail ou senha incorretos.' };
  }

  return { success: true, user };
};
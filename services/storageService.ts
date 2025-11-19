import { Process } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'processflow_data_v1';

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
import React from 'react';

export type BlockType = 'text' | 'image' | 'video' | 'audio' | 'checklist';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string; // URL for media, HTML/Text for text
  checklistItems?: ChecklistItem[]; // Only for checklist type
}

export type ShareVisibility = 'private' | 'link';
export type ShareRole = 'viewer' | 'editor';

export interface ShareSettings {
  visibility: ShareVisibility;
  role: ShareRole;
}

export interface Process {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  blocks: Block[];
  lastUpdated: number;
  isFavorite: boolean;
  shareSettings: ShareSettings;
}

export type ViewMode = 'dashboard' | 'editor' | 'viewer' | 'users';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}
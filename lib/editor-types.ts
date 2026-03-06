// Editor element types for drag-and-drop visual ticket editor

export type ElementType = 
  | 'text'
  | 'username'
  | 'password'
  | 'duration'
  | 'profile'
  | 'qrcode'
  | 'logo'
  | 'divider'
  | 'badge'
  | 'url'
  | 'contact';

export interface ElementPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface ElementSize {
  width: number; // percentage or auto
  height: number; // percentage or auto
}

export interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  opacity: number;
  fontFamily?: 'sans' | 'serif' | 'mono';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: number;
}

export interface BoxStyle {
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  borderOpacity: number;
  padding: number;
  blur?: number; // for glassmorphism effect
}

export interface TicketElement {
  id: string;
  type: ElementType;
  position: ElementPosition;
  size: ElementSize;
  rotation: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  
  // Content
  label?: string;
  content?: string;
  placeholder?: string; // for dynamic fields like {username}
  
  // Styles
  textStyle?: TextStyle;
  boxStyle?: BoxStyle;
  
  // Special properties
  showLabel?: boolean;
  iconName?: string;
}

export interface TicketBackground {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  imageUrl?: string;
  imageFit: 'cover' | 'contain' | 'fill';
  imageOpacity: number;
  overlayColor?: string;
  overlayOpacity?: number;
  pattern?: 'none' | 'waves' | 'dots' | 'grid';
  patternOpacity?: number;
}

export interface TicketDimensions {
  width: number; // in mm
  height: number; // in mm
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  borderOpacity: number;
}

export interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  dimensions: TicketDimensions;
  background: TicketBackground;
  elements: TicketElement[];
  createdAt: number;
  updatedAt: number;
  isBuiltIn: boolean;
}

export interface EditorState {
  activeTemplate: TicketTemplate | null;
  selectedElementId: string | null;
  isDragging: boolean;
  isResizing: boolean;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  history: TicketTemplate[];
  historyIndex: number;
}

// Helper function to create unique IDs
export function generateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default text style
export const defaultTextStyle: TextStyle = {
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  color: '#ffffff',
  opacity: 1,
  fontFamily: 'sans',
  textTransform: 'none',
  letterSpacing: 0,
};

// Default box style
export const defaultBoxStyle: BoxStyle = {
  backgroundColor: '#ffffff',
  backgroundOpacity: 0.1,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ffffff',
  borderOpacity: 0.2,
  padding: 12,
  blur: 0,
};

// Create a new element with defaults
export function createDefaultElement(type: ElementType): TicketElement {
  const baseElement: TicketElement = {
    id: generateId(),
    type,
    position: { x: 10, y: 10 },
    size: { width: 30, height: 10 },
    rotation: 0,
    visible: true,
    locked: false,
    zIndex: 1,
    textStyle: { ...defaultTextStyle },
  };

  switch (type) {
    case 'text':
      return {
        ...baseElement,
        content: 'Custom Text',
        placeholder: '',
      };
    case 'username':
      return {
        ...baseElement,
        label: "NOM D'UTILISATEUR",
        placeholder: '{username}',
        showLabel: true,
        boxStyle: { ...defaultBoxStyle },
        size: { width: 40, height: 18 },
      };
    case 'password':
      return {
        ...baseElement,
        label: 'MOT DE PASSE',
        placeholder: '{password}',
        showLabel: true,
        boxStyle: { ...defaultBoxStyle },
        size: { width: 40, height: 18 },
      };
    case 'duration':
      return {
        ...baseElement,
        label: 'DUREE',
        placeholder: '{duration}',
        showLabel: true,
        size: { width: 20, height: 15 },
      };
    case 'profile':
      return {
        ...baseElement,
        label: 'PROFIL',
        placeholder: '{profile}',
        showLabel: true,
        size: { width: 20, height: 15 },
      };
    case 'qrcode':
      return {
        ...baseElement,
        size: { width: 30, height: 40 },
        boxStyle: {
          ...defaultBoxStyle,
          backgroundColor: '#ffffff',
          backgroundOpacity: 1,
          borderRadius: 16,
          padding: 16,
        },
      };
    case 'logo':
      return {
        ...baseElement,
        size: { width: 15, height: 15 },
      };
    case 'divider':
      return {
        ...baseElement,
        size: { width: 1, height: 30 },
        boxStyle: {
          ...defaultBoxStyle,
          backgroundColor: '#ffffff',
          backgroundOpacity: 0.3,
        },
      };
    case 'badge':
      return {
        ...baseElement,
        content: 'Priority',
        size: { width: 18, height: 8 },
        textStyle: {
          ...defaultTextStyle,
          fontSize: 12,
          fontWeight: 'semibold',
          color: '#1a1a2e',
        },
        boxStyle: {
          ...defaultBoxStyle,
          backgroundColor: '#d4af37',
          backgroundOpacity: 1,
          borderRadius: 6,
          padding: 8,
        },
      };
    case 'url':
      return {
        ...baseElement,
        placeholder: '{loginUrl}',
        size: { width: 50, height: 8 },
        textStyle: {
          ...defaultTextStyle,
          fontSize: 10,
          opacity: 0.7,
        },
      };
    case 'contact':
      return {
        ...baseElement,
        content: 'Facebook: WiFi De Tsararano',
        size: { width: 40, height: 6 },
        textStyle: {
          ...defaultTextStyle,
          fontSize: 11,
          opacity: 0.8,
        },
      };
    default:
      return baseElement;
  }
}

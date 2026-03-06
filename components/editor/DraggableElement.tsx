"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TicketElement } from "@/lib/editor-types";
import { Move, Lock, Trash2, Copy } from "lucide-react";

interface DraggableElementProps {
  element: TicketElement;
  isSelected: boolean;
  canvasScale: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<TicketElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  previewData?: {
    username: string;
    password: string;
    duration: string;
    profile: string;
    loginUrl: string;
  };
}

export function DraggableElement({
  element,
  isSelected,
  canvasScale,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  previewData,
}: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (element.locked) return;
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPos({ x: element.position.x, y: element.position.y });
      
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [element.locked, element.position]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || element.locked) return;
      
      const parent = elementRef.current?.parentElement;
      if (!parent) return;
      
      const parentRect = parent.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.x) / parentRect.width * 100;
      const deltaY = (e.clientY - dragStart.y) / parentRect.height * 100;
      
      const newX = Math.max(0, Math.min(100 - element.size.width, initialPos.x + deltaX));
      const newY = Math.max(0, Math.min(100 - element.size.height, initialPos.y + deltaY));
      
      onUpdate({
        position: { x: newX, y: newY },
      });
    },
    [isDragging, element.locked, element.size, dragStart, initialPos, onUpdate]
  );

  // Handle drag end
  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      if (element.locked) return;
      e.preventDefault();
      e.stopPropagation();
      
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialSize({ width: element.size.width, height: element.size.height });
      
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [element.locked, element.size]
  );

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing || element.locked) return;
      
      const parent = elementRef.current?.parentElement;
      if (!parent) return;
      
      const parentRect = parent.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.x) / parentRect.width * 100;
      const deltaY = (e.clientY - dragStart.y) / parentRect.height * 100;
      
      const newWidth = Math.max(5, Math.min(100 - element.position.x, initialSize.width + deltaX));
      const newHeight = Math.max(5, Math.min(100 - element.position.y, initialSize.height + deltaY));
      
      onUpdate({
        size: { width: newWidth, height: newHeight },
      });
    },
    [isResizing, element.locked, element.position, dragStart, initialSize, onUpdate]
  );

  // Handle resize end
  const handleResizeEnd = useCallback((e: React.PointerEvent) => {
    setIsResizing(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Get display content based on element type
  const getDisplayContent = () => {
    if (previewData) {
      switch (element.type) {
        case 'username':
          return previewData.username || 'AB-02';
        case 'password':
          return previewData.password || 'zRmSf';
        case 'duration':
          return previewData.duration || '1 mois';
        case 'profile':
          return previewData.profile || 'Priority';
        case 'url':
          return previewData.loginUrl || 'https://example.com/login';
        default:
          return element.content || element.placeholder || '';
      }
    }
    return element.content || element.placeholder || '';
  };

  // Render element content based on type
  const renderContent = () => {
    const textStyle = element.textStyle || {};
    const boxStyle = element.boxStyle;
    
    const textStyles: React.CSSProperties = {
      fontSize: `${textStyle.fontSize || 14}px`,
      fontWeight: textStyle.fontWeight || 'normal',
      fontStyle: textStyle.fontStyle || 'normal',
      textAlign: textStyle.textAlign || 'left',
      color: textStyle.color || '#ffffff',
      opacity: textStyle.opacity ?? 1,
      textTransform: textStyle.textTransform || 'none',
      letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
      fontFamily: textStyle.fontFamily === 'serif' ? 'Georgia, serif' : 
                  textStyle.fontFamily === 'mono' ? 'monospace' : 'inherit',
    };

    const containerStyles: React.CSSProperties = boxStyle ? {
      backgroundColor: `${boxStyle.backgroundColor}${Math.round((boxStyle.backgroundOpacity || 1) * 255).toString(16).padStart(2, '0')}`,
      borderRadius: `${boxStyle.borderRadius || 0}px`,
      borderWidth: `${boxStyle.borderWidth || 0}px`,
      borderStyle: boxStyle.borderWidth ? 'solid' : 'none',
      borderColor: `${boxStyle.borderColor}${Math.round((boxStyle.borderOpacity || 1) * 255).toString(16).padStart(2, '0')}`,
      padding: `${boxStyle.padding || 0}px`,
      backdropFilter: boxStyle.blur ? `blur(${boxStyle.blur}px)` : undefined,
    } : {};

    switch (element.type) {
      case 'qrcode':
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={containerStyles}
          >
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
                <rect x="10" y="10" width="25" height="25" fill="#000" />
                <rect x="65" y="10" width="25" height="25" fill="#000" />
                <rect x="10" y="65" width="25" height="25" fill="#000" />
                <rect x="15" y="15" width="15" height="15" fill="#fff" />
                <rect x="70" y="15" width="15" height="15" fill="#fff" />
                <rect x="15" y="70" width="15" height="15" fill="#fff" />
                <rect x="20" y="20" width="5" height="5" fill="#000" />
                <rect x="75" y="20" width="5" height="5" fill="#000" />
                <rect x="20" y="75" width="5" height="5" fill="#000" />
                <rect x="40" y="10" width="5" height="5" fill="#000" />
                <rect x="50" y="15" width="5" height="5" fill="#000" />
                <rect x="45" y="25" width="5" height="5" fill="#000" />
                <rect x="40" y="40" width="20" height="20" fill="#000" />
                <rect x="45" y="45" width="10" height="10" fill="#fff" />
                <rect x="65" y="45" width="5" height="5" fill="#000" />
                <rect x="75" y="55" width="5" height="5" fill="#000" />
                <rect x="45" y="65" width="5" height="5" fill="#000" />
                <rect x="55" y="75" width="5" height="5" fill="#000" />
                <rect x="65" y="70" width="10" height="10" fill="#000" />
              </svg>
            </div>
          </div>
        );
      
      case 'username':
      case 'password':
        return (
          <div className="w-full h-full flex flex-col justify-center" style={containerStyles}>
            {element.showLabel && element.label && (
              <span 
                className="text-xs uppercase tracking-wider mb-1"
                style={{ 
                  color: textStyle.color || '#ffffff', 
                  opacity: 0.6,
                  fontSize: `${Math.max(8, (textStyle.fontSize || 14) * 0.4)}px`,
                }}
              >
                {element.label}
              </span>
            )}
            <span style={textStyles}>{getDisplayContent()}</span>
          </div>
        );
      
      case 'duration':
      case 'profile':
        return (
          <div className="w-full h-full flex flex-col justify-center">
            {element.showLabel && element.label && (
              <span 
                className="text-xs uppercase tracking-wider mb-0.5"
                style={{ 
                  color: textStyle.color || '#ffffff', 
                  opacity: 0.6,
                  fontSize: `${Math.max(8, (textStyle.fontSize || 14) * 0.5)}px`,
                }}
              >
                {element.label}
              </span>
            )}
            <span style={textStyles}>{getDisplayContent()}</span>
          </div>
        );
      
      case 'badge':
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={containerStyles}
          >
            <span style={textStyles}>{element.content || 'Badge'}</span>
          </div>
        );
      
      case 'divider':
        return (
          <div 
            className="w-full h-full"
            style={{
              backgroundColor: boxStyle?.backgroundColor || '#ffffff',
              opacity: boxStyle?.backgroundOpacity || 0.3,
            }}
          />
        );
      
      default:
        return (
          <div className="w-full h-full flex items-start" style={containerStyles}>
            <span style={textStyles}>{getDisplayContent()}</span>
          </div>
        );
    }
  };

  if (!element.visible) return null;

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      } ${isDragging ? 'opacity-80' : ''}`}
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        width: `${element.size.width}%`,
        height: `${element.size.height}%`,
        zIndex: element.zIndex + (isSelected ? 100 : 0),
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerDown={handleDragStart}
      onPointerMove={isDragging ? handleDragMove : undefined}
      onPointerUp={isDragging ? handleDragEnd : undefined}
    >
      {renderContent()}
      
      {/* Selection controls */}
      {isSelected && !element.locked && (
        <>
          {/* Resize handle */}
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize flex items-center justify-center hover:bg-blue-600 transition-colors"
            onPointerDown={handleResizeStart}
            onPointerMove={isResizing ? handleResizeMove : undefined}
            onPointerUp={isResizing ? handleResizeEnd : undefined}
          >
            <Move className="w-2 h-2 text-white rotate-45" />
          </div>
          
          {/* Action buttons */}
          <div className="absolute -top-8 left-0 flex gap-1">
            <button
              className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ locked: true });
              }}
              title="Lock"
            >
              <Lock className="w-3 h-3" />
            </button>
            <button
              className="p-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
      
      {/* Lock indicator */}
      {element.locked && isSelected && (
        <div className="absolute -top-8 left-0">
          <button
            className="p-1 bg-amber-600 text-white rounded hover:bg-amber-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ locked: false });
            }}
            title="Unlock"
          >
            <Lock className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

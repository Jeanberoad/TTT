"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { TicketTemplate, TicketElement, generateId } from "@/lib/editor-types";
import { DraggableElement } from "./DraggableElement";
import { ZoomIn, ZoomOut, Grid3X3, RotateCcw } from "lucide-react";

interface EditorCanvasProps {
  template: TicketTemplate;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<TicketElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onUpdateTemplate: (updates: Partial<TicketTemplate>) => void;
  previewData?: {
    username: string;
    password: string;
    duration: string;
    profile: string;
    loginUrl: string;
  };
}

export function EditorCanvas({
  template,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onUpdateTemplate,
  previewData,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Calculate canvas size based on template dimensions
  useEffect(() => {
    const updateSize = () => {
      const container = canvasRef.current?.parentElement;
      if (!container) return;
      
      const maxWidth = container.clientWidth - 48;
      const maxHeight = container.clientHeight - 48;
      
      const aspectRatio = template.dimensions.width / template.dimensions.height;
      
      let width = maxWidth;
      let height = width / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      setCanvasSize({ width: width * zoom, height: height * zoom });
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [template.dimensions, zoom]);

  // Handle click on canvas background to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  // Render background based on template settings
  const renderBackground = () => {
    const bg = template.background;
    const styles: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      borderRadius: `${template.dimensions.borderRadius}px`,
      overflow: 'hidden',
    };

    if (bg.type === 'solid') {
      return <div style={{ ...styles, backgroundColor: bg.color }} />;
    }

    if (bg.type === 'gradient') {
      return (
        <div
          style={{
            ...styles,
            background: `linear-gradient(${bg.gradientAngle || 135}deg, ${bg.gradientFrom}, ${bg.gradientTo})`,
          }}
        />
      );
    }

    if (bg.type === 'image' && bg.imageUrl) {
      return (
        <>
          <div
            style={{
              ...styles,
              backgroundImage: `url(${bg.imageUrl})`,
              backgroundSize: bg.imageFit,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: bg.imageOpacity,
            }}
          />
          {bg.overlayColor && (
            <div
              style={{
                ...styles,
                backgroundColor: bg.overlayColor,
                opacity: bg.overlayOpacity || 0.3,
              }}
            />
          )}
        </>
      );
    }

    return <div style={{ ...styles, backgroundColor: bg.color }} />;
  };

  // Render wave pattern overlay
  const renderPattern = () => {
    const bg = template.background;
    if (!bg.pattern || bg.pattern === 'none') return null;

    const opacity = bg.patternOpacity || 0.1;

    if (bg.pattern === 'waves') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity, borderRadius: `${template.dimensions.borderRadius}px` }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M0 10 Q 25 0, 50 10 T 100 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-white"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#waves)" />
        </svg>
      );
    }

    if (bg.pattern === 'dots') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity, borderRadius: `${template.dimensions.borderRadius}px` }}
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" className="text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      );
    }

    if (bg.pattern === 'grid') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity, borderRadius: `${template.dimensions.borderRadius}px` }}
        >
          <defs>
            <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {template.dimensions.width}mm x {template.dimensions.height}mm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-lg transition-colors ${
              showGrid
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            disabled={zoom <= 0.5}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium w-14 text-center text-gray-700 dark:text-gray-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            disabled={zoom >= 2}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            onClick={() => setZoom(1)}
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div
          ref={canvasRef}
          className="relative shadow-2xl transition-all duration-200"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            borderRadius: `${template.dimensions.borderRadius}px`,
            borderWidth: template.dimensions.borderWidth,
            borderStyle: 'solid',
            borderColor: `${template.dimensions.borderColor}${Math.round((template.dimensions.borderOpacity || 1) * 255).toString(16).padStart(2, '0')}`,
          }}
          onClick={handleCanvasClick}
        >
          {/* Background */}
          {renderBackground()}
          
          {/* Pattern overlay */}
          {renderPattern()}
          
          {/* Grid overlay */}
          {showGrid && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ borderRadius: `${template.dimensions.borderRadius}px` }}
            >
              <defs>
                <pattern id="editor-grid" x="0" y="0" width="10%" height="10%" patternUnits="objectBoundingBox">
                  <path
                    d="M 100 0 L 0 0 0 100"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editor-grid)" />
            </svg>
          )}
          
          {/* Elements */}
          {template.elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => (
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                canvasScale={zoom}
                onSelect={() => onSelectElement(element.id)}
                onUpdate={(updates) => onUpdateElement(element.id, updates)}
                onDelete={() => onDeleteElement(element.id)}
                onDuplicate={() => onDuplicateElement(element.id)}
                previewData={previewData}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

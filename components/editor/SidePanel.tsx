"use client";

import { useState, useRef } from "react";
import {
  TicketTemplate,
  TicketElement,
  ElementType,
  createDefaultElement,
  generateId,
} from "@/lib/editor-types";
import { builtInTemplates, createBlankTemplate, cloneTemplate } from "@/lib/templates";
import {
  Type,
  User,
  Key,
  Clock,
  Badge,
  QrCode,
  Image,
  Minus,
  MessageSquare,
  Link,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  Palette,
  Square,
  Layers,
  Settings,
  Save,
  FolderOpen,
} from "lucide-react";

interface SidePanelProps {
  template: TicketTemplate;
  selectedElement: TicketElement | null;
  onUpdateTemplate: (updates: Partial<TicketTemplate>) => void;
  onUpdateElement: (id: string, updates: Partial<TicketElement>) => void;
  onAddElement: (element: TicketElement) => void;
  onSelectTemplate: (template: TicketTemplate) => void;
  onSaveTemplate: () => void;
  savedTemplates: TicketTemplate[];
  onDeleteSavedTemplate: (id: string) => void;
}

const elementTypes: { type: ElementType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
  { type: 'username', label: 'Username', icon: <User className="w-4 h-4" /> },
  { type: 'password', label: 'Password', icon: <Key className="w-4 h-4" /> },
  { type: 'duration', label: 'Duration', icon: <Clock className="w-4 h-4" /> },
  { type: 'profile', label: 'Profile', icon: <Badge className="w-4 h-4" /> },
  { type: 'qrcode', label: 'QR Code', icon: <QrCode className="w-4 h-4" /> },
  { type: 'badge', label: 'Badge', icon: <Badge className="w-4 h-4" /> },
  { type: 'url', label: 'URL', icon: <Link className="w-4 h-4" /> },
  { type: 'contact', label: 'Contact', icon: <MessageSquare className="w-4 h-4" /> },
  { type: 'divider', label: 'Divider', icon: <Minus className="w-4 h-4" /> },
];

export function SidePanel({
  template,
  selectedElement,
  onUpdateTemplate,
  onUpdateElement,
  onAddElement,
  onSelectTemplate,
  onSaveTemplate,
  savedTemplates,
  onDeleteSavedTemplate,
}: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'elements' | 'style' | 'background'>('templates');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    templates: true,
    saved: false,
    elements: true,
    text: true,
    box: true,
    dimensions: true,
    background: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddElement = (type: ElementType) => {
    const newElement = createDefaultElement(type);
    onAddElement(newElement);
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      onUpdateTemplate({
        background: {
          ...template.background,
          type: 'image',
          imageUrl,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const renderTemplatesTab = () => (
    <div className="space-y-4">
      {/* Built-in Templates */}
      <div>
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          onClick={() => toggleSection('templates')}
        >
          <span>Built-in Templates</span>
          {expandedSections.templates ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.templates && (
          <div className="grid grid-cols-2 gap-2">
            {builtInTemplates.map((t) => (
              <button
                key={t.id}
                className={`p-2 rounded-lg border-2 transition-all text-left ${
                  template.id === t.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => onSelectTemplate(cloneTemplate(t))}
              >
                <div
                  className="w-full h-12 rounded mb-1"
                  style={{
                    background:
                      t.background.type === 'gradient'
                        ? `linear-gradient(${t.background.gradientAngle || 135}deg, ${t.background.gradientFrom}, ${t.background.gradientTo})`
                        : t.background.type === 'image'
                        ? `url(${t.background.imageUrl}) center/cover`
                        : t.background.color,
                  }}
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block truncate">
                  {t.name}
                </span>
              </button>
            ))}
            <button
              className="p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-all flex flex-col items-center justify-center h-[76px]"
              onClick={() => onSelectTemplate(createBlankTemplate())}
            >
              <Plus className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Blank</span>
            </button>
          </div>
        )}
      </div>

      {/* Saved Templates */}
      <div>
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          onClick={() => toggleSection('saved')}
        >
          <span>Saved Templates ({savedTemplates.length})</span>
          {expandedSections.saved ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.saved && (
          <div className="space-y-2">
            {savedTemplates.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
                No saved templates yet. Click Save to create one.
              </p>
            ) : (
              savedTemplates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => onSelectTemplate(cloneTemplate(t))}
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block truncate">
                      {t.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    onClick={() => onDeleteSavedTemplate(t.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
        onClick={onSaveTemplate}
      >
        <Save className="w-4 h-4" />
        Save Template
      </button>
    </div>
  );

  const renderElementsTab = () => (
    <div className="space-y-4">
      {/* Add Elements */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Add Element
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {elementTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => handleAddElement(type)}
            >
              {icon}
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Elements */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Elements ({template.elements.length})
        </h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {template.elements.map((el) => (
            <div
              key={el.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedElement?.id === el.id
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                {el.label || el.content || el.type}
              </span>
              <span className="text-xs text-gray-400">{el.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStyleTab = () => {
    if (!selectedElement) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Settings className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm text-center">Select an element to edit its style</p>
        </div>
      );
    }

    const textStyle = selectedElement.textStyle || {};
    const boxStyle = selectedElement.boxStyle || {};

    return (
      <div className="space-y-4">
        {/* Text Style */}
        {selectedElement.type !== 'qrcode' && selectedElement.type !== 'divider' && (
          <div>
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              onClick={() => toggleSection('text')}
            >
              <span>Text Style</span>
              {expandedSections.text ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.text && (
              <div className="space-y-3">
                {/* Content */}
                {(selectedElement.type === 'text' || selectedElement.type === 'badge' || selectedElement.type === 'contact') && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Content</label>
                    <input
                      type="text"
                      value={selectedElement.content || ''}
                      onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Label */}
                {selectedElement.showLabel !== undefined && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Label</label>
                    <input
                      type="text"
                      value={selectedElement.label || ''}
                      onChange={(e) => onUpdateElement(selectedElement.id, { label: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Font Size */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Font Size: {textStyle.fontSize || 14}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={textStyle.fontSize || 14}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        textStyle: { ...textStyle, fontSize: parseInt(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Font Weight */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Font Weight</label>
                  <select
                    value={textStyle.fontWeight || 'normal'}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        textStyle: { ...textStyle, fontWeight: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                {/* Text Color */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textStyle.color || '#ffffff'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          textStyle: { ...textStyle, color: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textStyle.color || '#ffffff'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          textStyle: { ...textStyle, color: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Text Align */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Text Align</label>
                  <div className="flex gap-1">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                          textStyle.textAlign === align
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            textStyle: { ...textStyle, textAlign: align as any },
                          })
                        }
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Style */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Style</label>
                  <div className="flex gap-1">
                    <button
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        textStyle.fontStyle === 'italic'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() =>
                        onUpdateElement(selectedElement.id, {
                          textStyle: {
                            ...textStyle,
                            fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic',
                          },
                        })
                      }
                    >
                      <i>Italic</i>
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        textStyle.textTransform === 'uppercase'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() =>
                        onUpdateElement(selectedElement.id, {
                          textStyle: {
                            ...textStyle,
                            textTransform: textStyle.textTransform === 'uppercase' ? 'none' : 'uppercase',
                          },
                        })
                      }
                    >
                      UPPER
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Box Style */}
        {selectedElement.boxStyle && (
          <div>
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              onClick={() => toggleSection('box')}
            >
              <span>Box Style</span>
              {expandedSections.box ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.box && (
              <div className="space-y-3">
                {/* Background Color */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={boxStyle.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          boxStyle: { ...boxStyle, backgroundColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={boxStyle.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          boxStyle: { ...boxStyle, backgroundColor: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Background Opacity */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Background Opacity: {Math.round((boxStyle.backgroundOpacity || 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(boxStyle.backgroundOpacity || 1) * 100}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        boxStyle: { ...boxStyle, backgroundOpacity: parseInt(e.target.value) / 100 },
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Border Radius */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Border Radius: {boxStyle.borderRadius || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={boxStyle.borderRadius || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        boxStyle: { ...boxStyle, borderRadius: parseInt(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Padding */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Padding: {boxStyle.padding || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={boxStyle.padding || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        boxStyle: { ...boxStyle, padding: parseInt(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Blur (Glassmorphism) */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Blur Effect: {boxStyle.blur || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={boxStyle.blur || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        boxStyle: { ...boxStyle, blur: parseInt(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBackgroundTab = () => (
    <div className="space-y-4">
      {/* Dimensions */}
      <div>
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          onClick={() => toggleSection('dimensions')}
        >
          <span>Ticket Dimensions</span>
          {expandedSections.dimensions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {expandedSections.dimensions && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Width (mm)</label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={template.dimensions.width}
                  onChange={(e) =>
                    onUpdateTemplate({
                      dimensions: { ...template.dimensions, width: parseInt(e.target.value) || 85 },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Height (mm)</label>
                <input
                  type="number"
                  min="30"
                  max="120"
                  value={template.dimensions.height}
                  onChange={(e) =>
                    onUpdateTemplate({
                      dimensions: { ...template.dimensions, height: parseInt(e.target.value) || 55 },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                Border Radius: {template.dimensions.borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="32"
                value={template.dimensions.borderRadius}
                onChange={(e) =>
                  onUpdateTemplate({
                    dimensions: { ...template.dimensions, borderRadius: parseInt(e.target.value) },
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Border</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={template.dimensions.borderColor}
                  onChange={(e) =>
                    onUpdateTemplate({
                      dimensions: { ...template.dimensions, borderColor: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={template.dimensions.borderWidth}
                  onChange={(e) =>
                    onUpdateTemplate({
                      dimensions: { ...template.dimensions, borderWidth: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Width"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background */}
      <div>
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          onClick={() => toggleSection('background')}
        >
          <span>Background</span>
          {expandedSections.background ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {expandedSections.background && (
          <div className="space-y-3">
            {/* Type */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Type</label>
              <div className="flex gap-1">
                {['solid', 'gradient', 'image'].map((type) => (
                  <button
                    key={type}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      template.background.type === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() =>
                      onUpdateTemplate({
                        background: { ...template.background, type: type as any },
                      })
                    }
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Color */}
            {template.background.type === 'solid' && (
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={template.background.color}
                    onChange={(e) =>
                      onUpdateTemplate({
                        background: { ...template.background, color: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={template.background.color}
                    onChange={(e) =>
                      onUpdateTemplate({
                        background: { ...template.background, color: e.target.value },
                      })
                    }
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Gradient */}
            {template.background.type === 'gradient' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">From</label>
                    <input
                      type="color"
                      value={template.background.gradientFrom || '#667eea'}
                      onChange={(e) =>
                        onUpdateTemplate({
                          background: { ...template.background, gradientFrom: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">To</label>
                    <input
                      type="color"
                      value={template.background.gradientTo || '#764ba2'}
                      onChange={(e) =>
                        onUpdateTemplate({
                          background: { ...template.background, gradientTo: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Angle: {template.background.gradientAngle || 135}deg
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={template.background.gradientAngle || 135}
                    onChange={(e) =>
                      onUpdateTemplate({
                        background: { ...template.background, gradientAngle: parseInt(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Image */}
            {template.background.type === 'image' && (
              <>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Upload Image</label>
                  <input
                    ref={bgImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                  />
                  <button
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
                    onClick={() => bgImageInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    {template.background.imageUrl ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
                {template.background.imageUrl && (
                  <>
                    <div
                      className="w-full h-20 rounded-lg bg-cover bg-center border border-gray-300 dark:border-gray-600"
                      style={{ backgroundImage: `url(${template.background.imageUrl})` }}
                    />
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fit</label>
                      <select
                        value={template.background.imageFit}
                        onChange={(e) =>
                          onUpdateTemplate({
                            background: { ...template.background, imageFit: e.target.value as any },
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                        Opacity: {Math.round(template.background.imageOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={template.background.imageOpacity * 100}
                        onChange={(e) =>
                          onUpdateTemplate({
                            background: { ...template.background, imageOpacity: parseInt(e.target.value) / 100 },
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Pattern */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Pattern Overlay</label>
              <select
                value={template.background.pattern || 'none'}
                onChange={(e) =>
                  onUpdateTemplate({
                    background: { ...template.background, pattern: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="none">None</option>
                <option value="waves">Waves</option>
                <option value="dots">Dots</option>
                <option value="grid">Grid</option>
              </select>
            </div>
            {template.background.pattern && template.background.pattern !== 'none' && (
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Pattern Opacity: {Math.round((template.background.patternOpacity || 0.1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={(template.background.patternOpacity || 0.1) * 100}
                  onChange={(e) =>
                    onUpdateTemplate({
                      background: { ...template.background, patternOpacity: parseInt(e.target.value) / 100 },
                    })
                  }
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'templates', label: 'Templates', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'elements', label: 'Elements', icon: <Layers className="w-4 h-4" /> },
    { id: 'style', label: 'Style', icon: <Palette className="w-4 h-4" /> },
    { id: 'background', label: 'Background', icon: <Image className="w-4 h-4" /> },
  ];

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'elements' && renderElementsTab()}
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'background' && renderBackgroundTab()}
      </div>
    </div>
  );
}

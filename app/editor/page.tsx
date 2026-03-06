"use client";

import { useState, useCallback, useEffect } from "react";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { SidePanel } from "@/components/editor/SidePanel";
import { TicketTemplate, TicketElement, generateId } from "@/lib/editor-types";
import { builtInTemplates, cloneTemplate } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  ArrowLeft, 
  Download, 
  FileDown, 
  Printer, 
  Eye, 
  EyeOff,
  Undo2,
  Redo2,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

// Constants for local storage
const SAVED_TEMPLATES_KEY = "ticket-editor-saved-templates";
const CURRENT_TEMPLATE_KEY = "ticket-editor-current-template";

export default function EditorPage() {
  const { toast } = useToast();
  
  // Editor state
  const [template, setTemplate] = useState<TicketTemplate>(() => {
    // Try to load from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CURRENT_TEMPLATE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return cloneTemplate(builtInTemplates[0]);
  });
  
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<TicketTemplate[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [history, setHistory] = useState<TicketTemplate[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Preview data for testing
  const previewData = {
    username: "AB-02",
    password: "zRmSf",
    duration: "1 mois",
    profile: "Priority",
    loginUrl: "http://wifi.local/login",
  };

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_TEMPLATES_KEY);
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save current template to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CURRENT_TEMPLATE_KEY, JSON.stringify(template));
  }, [template]);

  // Add to history for undo/redo
  const addToHistory = useCallback((newTemplate: TicketTemplate) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newTemplate)));
      // Keep only last 50 states
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTemplate(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTemplate(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Update template with history tracking
  const updateTemplate = useCallback((updates: Partial<TicketTemplate>) => {
    setTemplate(prev => {
      const newTemplate = { ...prev, ...updates, updatedAt: Date.now() };
      addToHistory(newTemplate);
      return newTemplate;
    });
  }, [addToHistory]);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<TicketElement>) => {
    setTemplate(prev => {
      const newTemplate = {
        ...prev,
        elements: prev.elements.map(el => 
          el.id === id ? { ...el, ...updates } : el
        ),
        updatedAt: Date.now(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
  }, [addToHistory]);

  // Add element
  const addElement = useCallback((element: TicketElement) => {
    setTemplate(prev => {
      const maxZIndex = prev.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
      const newElement = { ...element, zIndex: maxZIndex + 1 };
      const newTemplate = {
        ...prev,
        elements: [...prev.elements, newElement],
        updatedAt: Date.now(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
    setSelectedElementId(element.id);
    toast({
      title: "Element ajouté",
      description: `${element.type} a été ajouté au ticket`,
    });
  }, [addToHistory, toast]);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setTemplate(prev => {
      const newTemplate = {
        ...prev,
        elements: prev.elements.filter(el => el.id !== id),
        updatedAt: Date.now(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    toast({
      title: "Element supprimé",
      description: "L'élément a été supprimé du ticket",
    });
  }, [addToHistory, selectedElementId, toast]);

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
    const element = template.elements.find(el => el.id === id);
    if (!element) return;
    
    const maxZIndex = template.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const newElement: TicketElement = {
      ...element,
      id: generateId(),
      position: {
        x: Math.min(element.position.x + 5, 100 - element.size.width),
        y: Math.min(element.position.y + 5, 100 - element.size.height),
      },
      zIndex: maxZIndex + 1,
    };
    
    setTemplate(prev => {
      const newTemplate = {
        ...prev,
        elements: [...prev.elements, newElement],
        updatedAt: Date.now(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
    setSelectedElementId(newElement.id);
    toast({
      title: "Element dupliqué",
      description: "L'élément a été dupliqué",
    });
  }, [template.elements, addToHistory, toast]);

  // Select template
  const selectTemplate = useCallback((newTemplate: TicketTemplate) => {
    setTemplate(newTemplate);
    setSelectedElementId(null);
    addToHistory(newTemplate);
    toast({
      title: "Template chargé",
      description: `Le template "${newTemplate.name}" a été chargé`,
    });
  }, [addToHistory, toast]);

  // Save template
  const saveTemplate = useCallback(() => {
    const name = prompt("Nom du template:", template.name);
    if (!name) return;
    
    const templateToSave: TicketTemplate = {
      ...template,
      id: generateId(),
      name,
      updatedAt: Date.now(),
      isBuiltIn: false,
    };
    
    const newSavedTemplates = [...savedTemplates, templateToSave];
    setSavedTemplates(newSavedTemplates);
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(newSavedTemplates));
    
    toast({
      title: "Template sauvegardé",
      description: `Le template "${name}" a été sauvegardé`,
    });
  }, [template, savedTemplates, toast]);

  // Delete saved template
  const deleteSavedTemplate = useCallback((id: string) => {
    const newSavedTemplates = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(newSavedTemplates);
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(newSavedTemplates));
    toast({
      title: "Template supprimé",
      description: "Le template a été supprimé",
    });
  }, [savedTemplates, toast]);

  // Export template as JSON
  const exportTemplate = useCallback(() => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", `${template.name.replace(/\s+/g, "-").toLowerCase()}.json`);
    linkElement.click();
    toast({
      title: "Template exporté",
      description: "Le fichier JSON a été téléchargé",
    });
  }, [template, toast]);

  // Get selected element
  const selectedElement = template.elements.find(el => el.id === selectedElementId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top Toolbar */}
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={template.name}
              onChange={(e) => updateTemplate({ name: e.target.value })}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Rétablir (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded-lg transition-colors ${
              showPreview
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
            title="Aperçu avec données"
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Export */}
          <button
            onClick={exportTemplate}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            title="Exporter JSON"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Use Template - Goes back to main page */}
          <Link
            href={`/?template=${encodeURIComponent(JSON.stringify(template))}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Utiliser ce template</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <EditorCanvas
          template={template}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onDuplicateElement={duplicateElement}
          onUpdateTemplate={updateTemplate}
          previewData={showPreview ? previewData : undefined}
        />

        {/* Side Panel */}
        <SidePanel
          template={template}
          selectedElement={selectedElement}
          onUpdateTemplate={updateTemplate}
          onUpdateElement={updateElement}
          onAddElement={addElement}
          onSelectTemplate={selectTemplate}
          onSaveTemplate={saveTemplate}
          savedTemplates={savedTemplates}
          onDeleteSavedTemplate={deleteSavedTemplate}
        />
      </div>

      {/* Help tooltip */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="group relative">
          <button className="p-3 bg-white dark:bg-gray-800 shadow-lg rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Raccourcis clavier</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+Z</kbd> Annuler</li>
              <li><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+Y</kbd> Rétablir</li>
              <li><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Delete</kbd> Supprimer</li>
              <li><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+D</kbd> Dupliquer</li>
            </ul>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

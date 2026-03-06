"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer, Wifi, Upload, FileText, X, Settings, Save, Loader2, Info } from "lucide-react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

// Types
interface TicketData {
  username: string;
  password?: string;
  profile: string;
  limit_uptime?: string;
  qr_url?: string;
}

interface Configuration {
  wifiName: string;
  subtitle: string;
  supportText: string;
  footerText: string;
  footerTextRight: string;
  ticketsPerPage: number;
  baseHost: string;
  logoUrl: string;
  template: string;
  qrStyle: string;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  borderWidth: number;
  fontSize: number;
  ticketWidth: number;
  ticketHeight: number;
}

const defaultConfig: Configuration = {
  wifiName: "",
  subtitle: "",
  supportText: "",
  footerText: "",
  footerTextRight: "",
  ticketsPerPage: 12,
  baseHost: "",
  logoUrl: "",
  template: "modern",
  qrStyle: "classic",
  primaryColor: "#0ea5e9",
  textColor: "#0f172a",
  backgroundColor: "#ffffff",
  borderRadius: 16,
  borderWidth: 2,
  fontSize: 14,
  ticketWidth: 350,
  ticketHeight: 240,
};

// Utility functions
function getQrUrl(ticket: TicketData, config: Configuration) {
  if (ticket.qr_url && ticket.qr_url.trim() !== "") return ticket.qr_url;
  if (config.baseHost) {
    const host = config.baseHost.endsWith('/') ? config.baseHost.slice(0, -1) : config.baseHost;
    const url = `${host}/login?username=${encodeURIComponent(ticket.username)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.username)}`;
}

// CSV Uploader Component
function CsvUploader({ onTicketsLoaded }: { onTicketsLoaded: (tickets: TicketData[]) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setError(null);

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const tickets: TicketData[] = results.data.map((row) => ({
            username: row.username || row.name || row.user || "",
            password: row.password || row.pass || undefined,
            profile: row.profile || row.plan || row.type || "default",
            limit_uptime: row.limit_uptime || row.uptime || row.duration || undefined,
            qr_url: row.qr_url || row.url || undefined,
          }));
          onTicketsLoaded(tickets);
        },
        error: (err) => {
          setError("Failed to parse CSV: " + err.message);
        },
      });
    },
    [onTicketsLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".csv", ".txt"] },
    multiple: false,
  });

  const clearFile = () => {
    setFileName(null);
    setError(null);
    onTicketsLoaded([]);
  };

  return (
    <div className="space-y-3">
      {!fileName ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary/10 p-4 rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {isDragActive ? "Drop your CSV here" : "Upload CSV File"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Expected columns: username, password, profile, limit_uptime, qr_url
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl dark:bg-green-950/30 dark:border-green-800">
          <div className="bg-green-100 p-2 rounded-lg dark:bg-green-900">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800 truncate dark:text-green-200">{fileName}</p>
            <p className="text-xs text-green-600 dark:text-green-400">CSV loaded successfully</p>
          </div>
          <button
            onClick={clearFile}
            className="p-1.5 hover:bg-green-100 rounded-lg transition-colors dark:hover:bg-green-900"
          >
            <X className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}

// Config Panel Component
function ConfigPanel({ config, onConfigChange }: { config: Configuration; onConfigChange: (config: Configuration) => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Configuration>(config);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('ticket-config', JSON.stringify(formData));
    onConfigChange(formData);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuration Saved",
        description: "Your ticket template settings have been updated.",
      });
    }, 300);
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-bold text-foreground">Template Configuration</h2>
          <p className="text-xs text-muted-foreground">Customize how your printed tickets look.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[600px]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">WiFi Network Name</label>
            <input
              type="text"
              name="wifiName"
              value={formData.wifiName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              placeholder="e.g. WiFi De Tsararano"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              placeholder="e.g. Connexion Internet"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Support Text (Left)</label>
              <input
                type="text"
                name="supportText"
                value={formData.supportText}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="e.g. Facebook: MyWiFi"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Footer Text (Center)</label>
              <input
                type="text"
                name="footerText"
                value={formData.footerText}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="e.g. 24/7 Support"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Footer Text (Right)</label>
            <input
              type="text"
              name="footerTextRight"
              value={formData.footerTextRight}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              placeholder="e.g. Free WiFi"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Upload Logo (PNG/ICO)</label>
            <input
              type="file"
              accept=".png,.ico,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="w-full text-xs"
            />
            {formData.logoUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={formData.logoUrl} className="w-10 h-10 object-contain border rounded" alt="Preview" />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, logoUrl: "" }))}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove Logo
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Template</label>
              <select
                name="template"
                value={formData.template}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
              >
                <option value="modern">Modern</option>
                <option value="minimalist">Minimalist</option>
                <option value="premium">Premium</option>
                <option value="black_white">Black & White</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">QR Style</label>
              <select
                name="qrStyle"
                value={formData.qrStyle}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
              >
                <option value="classic">Classic</option>
                <option value="bordered">Bordered</option>
                <option value="round">Round</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Router Base Host</label>
            <div className="flex flex-col gap-1">
              <input
                type="text"
                name="baseHost"
                value={formData.baseHost}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="https://your-mikrotik-host.net"
              />
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" /> Used to build QR codes if none provided in CSV.
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Tickets Per Page</label>
            <input
              type="number"
              name="ticketsPerPage"
              value={formData.ticketsPerPage}
              onChange={handleChange}
              min={1}
              max={30}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              Style Editor
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="h-9 w-12 p-0 border rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1 text-xs border rounded-lg uppercase"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    className="h-9 w-12 p-0 border rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1 text-xs border rounded-lg uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Ticket Width</label>
                <input
                  type="number"
                  name="ticketWidth"
                  value={formData.ticketWidth}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-xs border rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Ticket Height</label>
                <input
                  type="number"
                  name="ticketHeight"
                  value={formData.ticketHeight}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-xs border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full mt-4 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Configuration
        </button>
      </form>
    </div>
  );
}

// Ticket Templates
function ModernTicket({ ticket, config, qrUrl }: { ticket: TicketData; config: Configuration; qrUrl: string }) {
  return (
    <div
      className="ticket-card-content relative overflow-hidden flex flex-col"
      style={{
        width: config.ticketWidth || 350,
        minHeight: config.ticketHeight || 240,
        backgroundColor: config.backgroundColor || "#ffffff",
        borderRadius: config.borderRadius || 16,
        border: `${config.borderWidth || 2}px solid`,
        borderColor: config.primaryColor || "#0ea5e9",
        fontSize: config.fontSize || 14,
        color: config.textColor || "#0f172a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: config.primaryColor || "#0ea5e9" }}
      >
        {config.logoUrl && (
          <img src={config.logoUrl} className="w-7 h-7 object-contain rounded bg-white/20 p-0.5" alt="Logo" />
        )}
        <div>
          <p className="font-bold text-white leading-tight text-sm">{config.wifiName || "WiFi Network"}</p>
          {config.subtitle && <p className="text-white/80 text-[10px]">{config.subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-1 p-4 gap-4">
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: config.textColor }}>Username</p>
            <p className="font-mono font-black text-lg leading-none mt-1">{ticket.username}</p>
          </div>
          {ticket.password && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: config.textColor }}>Password</p>
              <p className="font-mono font-black text-lg leading-none mt-1">{ticket.password}</p>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            {ticket.profile && (
              <div className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold uppercase border">
                {ticket.profile}
              </div>
            )}
            {ticket.limit_uptime && (
              <div className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold uppercase border">
                {ticket.limit_uptime}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="bg-white p-1 rounded-lg shadow-sm border">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-24 h-24 object-contain block"
              style={{
                borderRadius: config.qrStyle === "round" ? 8 : 0,
              }}
            />
          </div>
          <p className="text-[8px] mt-1 opacity-50 font-bold uppercase">Scan to Connect</p>
        </div>
      </div>

      {(config.footerText || config.supportText || config.footerTextRight) && (
        <div
          className="px-4 py-2 flex justify-between items-center text-[10px] font-medium"
          style={{ backgroundColor: `${config.primaryColor}10`, borderTop: `1px solid ${config.primaryColor}20` }}
        >
          <span>{config.supportText}</span>
          <span className="font-bold">{config.footerText}</span>
          <span>{config.footerTextRight}</span>
        </div>
      )}
    </div>
  );
}

function MinimalistTicket({ ticket, config, qrUrl }: { ticket: TicketData; config: Configuration; qrUrl: string }) {
  return (
    <div
      className="ticket-card-content relative overflow-hidden bg-white"
      style={{
        width: config.ticketWidth || 350,
        minHeight: config.ticketHeight || 240,
        borderRadius: config.borderRadius || 0,
        border: `${config.borderWidth || 1}px solid #00000010`,
        fontSize: config.fontSize || 14,
        color: "#1a1a1a",
      }}
    >
      <div className="p-6 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-xl tracking-tighter uppercase">{config.wifiName || "WIFI"}</h3>
            <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">{config.subtitle || "Access Ticket"}</p>
          </div>
          {config.logoUrl && <img src={config.logoUrl} className="w-8 h-8 object-contain grayscale opacity-80" alt="logo" />}
        </div>

        <div className="flex items-center gap-6 my-4">
          <img src={qrUrl} alt="QR" className="w-24 h-24" />
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold uppercase opacity-40">User</p>
              <p className="font-mono font-bold text-base">{ticket.username}</p>
            </div>
            {ticket.password && (
              <div>
                <p className="text-[9px] font-bold uppercase opacity-40">Pass</p>
                <p className="font-mono font-bold text-base">{ticket.password}</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-dashed flex justify-between items-center opacity-60">
          <p className="text-[9px] font-bold uppercase tracking-widest">{ticket.profile || "Standard"}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest">{config.footerText || "Thank you"}</p>
        </div>
      </div>
    </div>
  );
}

function PremiumTicket({ ticket, config, qrUrl }: { ticket: TicketData; config: Configuration; qrUrl: string }) {
  const accentColor = config.primaryColor || "#d4af37";
  return (
    <div
      className="ticket-card-content relative overflow-hidden"
      style={{
        width: config.ticketWidth || 350,
        minHeight: config.ticketHeight || 240,
        backgroundColor: config.backgroundColor || "#1a1a1a",
        borderRadius: config.borderRadius || 24,
        border: `${config.borderWidth || 3}px solid ${accentColor}`,
        fontSize: config.fontSize || 14,
        color: config.textColor || "#ffffff",
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }} />

      <div className="relative z-10 p-5 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            {config.logoUrl && <img src={config.logoUrl} className="w-10 h-10 object-contain" alt="logo" />}
            <div>
              <h3 className="font-display font-black text-lg tracking-tight uppercase" style={{ color: accentColor }}>{config.wifiName || "PREMIUM WIFI"}</h3>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 italic">{config.subtitle || "Exclusive Connection"}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full border border-white/20 bg-white/5 uppercase tracking-widest">
              {ticket.profile || "VIP ACCESS"}
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-around gap-4 px-2">
          <div className="space-y-4 flex-1">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">Credentials</p>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] opacity-60">Username:</span>
                  <span className="font-mono font-bold text-sm tracking-tight">{ticket.username}</span>
                </div>
                {ticket.password && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] opacity-60">Password:</span>
                    <span className="font-mono font-bold text-sm tracking-tight">{ticket.password}</span>
                  </div>
                )}
              </div>
            </div>
            {ticket.limit_uptime && (
              <p className="text-[10px] text-center italic opacity-60">Valid for: <span className="font-bold text-white">{ticket.limit_uptime}</span></p>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="p-2 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <img src={qrUrl} alt="QR" className="w-20 h-20" />
            </div>
            <p className="text-[7px] mt-2 font-bold uppercase tracking-[0.3em] opacity-40">Instant Connect</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-50">
          <span>{config.supportText}</span>
          <span style={{ color: accentColor }}>{config.footerText}</span>
        </div>
      </div>
    </div>
  );
}

function BlackWhiteTicket({ ticket, config, qrUrl }: { ticket: TicketData; config: Configuration; qrUrl: string }) {
  return (
    <div
      className="ticket-card-content relative overflow-hidden bg-white text-black border-2 border-black"
      style={{
        width: config.ticketWidth || 350,
        minHeight: config.ticketHeight || 240,
        borderRadius: 0,
        fontSize: config.fontSize || 14,
      }}
    >
      <div className="p-4 flex flex-col h-full border-[6px] border-black">
        <div className="bg-black text-white p-2 text-center mb-4">
          <h2 className="font-black text-2xl uppercase italic tracking-tighter">{config.wifiName || "WIFI ACCESS"}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest">{config.subtitle || "Internet Ticket"}</p>
        </div>

        <div className="flex-1 flex gap-4">
          <div className="flex-1 border-2 border-black p-3 flex flex-col justify-center">
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase underline">Username</p>
              <p className="font-mono font-black text-xl">{ticket.username}</p>
            </div>
            {ticket.password && (
              <div>
                <p className="text-[10px] font-black uppercase underline">Password</p>
                <p className="font-mono font-black text-xl">{ticket.password}</p>
              </div>
            )}
          </div>
          <div className="border-2 border-black p-1 bg-white">
            <img src={qrUrl} alt="QR" className="w-24 h-24" />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-end border-t-4 border-black pt-2 font-black uppercase text-[10px]">
          <div className="flex flex-col">
            <span>{ticket.profile}</span>
            <span>{ticket.limit_uptime}</span>
          </div>
          <div className="text-right">
            <p>{config.footerText}</p>
            <p>{config.supportText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalTicket({ ticket, config, qrUrl }: { ticket: TicketData; config: Configuration; qrUrl: string }) {
  return (
    <div
      className="ticket-card-content relative overflow-hidden flex"
      style={{
        width: (config.ticketWidth || 350) * 1.3,
        minHeight: config.ticketHeight || 120,
        backgroundColor: config.backgroundColor || "#ffffff",
        borderRadius: config.borderRadius || 12,
        border: `${config.borderWidth || 2}px solid ${config.primaryColor || "#0ea5e9"}`,
        fontSize: config.fontSize || 13,
        color: config.textColor || "#0f172a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="w-20 flex flex-col items-center justify-center p-3 gap-2"
        style={{ backgroundColor: config.primaryColor || "#0ea5e9" }}
      >
        {config.logoUrl ? (
          <img src={config.logoUrl} className="w-12 h-12 object-contain bg-white/20 p-1 rounded-lg" alt="Logo" />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center text-white font-black text-lg">W</div>
        )}
        <span className="text-white font-black text-[9px] text-center leading-none uppercase tracking-tighter">{config.wifiName?.substring(0, 10) || "WiFi"}</span>
      </div>
      <div className="flex-1 flex items-center px-6 gap-6">
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="col-span-2 mb-1">
            <p className="font-black text-lg leading-tight uppercase tracking-tight">{config.wifiName || "WiFi Network"}</p>
            <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{config.subtitle || "Internet"}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase opacity-40">User</p>
            <p className="font-mono font-bold text-sm leading-none">{ticket.username}</p>
          </div>
          {ticket.password && (
            <div>
              <p className="text-[8px] font-bold uppercase opacity-40">Pass</p>
              <p className="font-mono font-bold text-sm leading-none">{ticket.password}</p>
            </div>
          )}
          <div className="col-span-2 pt-2 flex justify-between items-center border-t border-dashed">
             <span className="text-[8px] font-bold uppercase opacity-60">{ticket.profile || "Standard"}</span>
             <span className="text-[8px] font-bold uppercase opacity-60">{config.footerText || "Access"}</span>
          </div>
        </div>
        <div className="bg-white p-1 rounded-lg shadow-sm border border-black/5">
          <img src={qrUrl} alt="QR" className="w-20 h-20" />
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, config }: { ticket: TicketData; config: Configuration }) {
  const qrUrl = getQrUrl(ticket, config);

  switch (config.template) {
    case "minimalist":
      return <MinimalistTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
    case "horizontal":
      return <HorizontalTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
    case "premium":
      return <PremiumTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
    case "black_white":
      return <BlackWhiteTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
    case "modern":
    default:
      return <ModernTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
  }
}

// Main Page Component
export default function Home() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [config, setConfig] = useState<Configuration>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load config from localStorage on mount
    const savedConfig = localStorage.getItem('ticket-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch {
        // Use default config if parsing fails
      }
    }
    setIsLoading(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Wifi className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">WiFi Ticket Generator</h1>
              <p className="text-xs text-muted-foreground">Generate stylized hotspot access tickets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tickets.length > 0 && (
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {tickets.length} tickets
              </span>
            )}
            <button
              onClick={handlePrint}
              disabled={tickets.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm shadow-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <Printer className="w-4 h-4" />
              Print Tickets
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 flex gap-6 no-print">
        <aside className="w-80 shrink-0">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/30">
                <h2 className="font-display font-bold text-foreground">Upload Tickets</h2>
                <p className="text-xs text-muted-foreground">Import from MikroTik CSV export</p>
              </div>
              <div className="p-4">
                <CsvUploader onTicketsLoaded={setTickets} />
              </div>
            </div>

            <ConfigPanel config={config} onConfigChange={setConfig} />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="bg-muted/50 p-8 rounded-2xl">
                <Wifi className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-muted-foreground">No tickets yet</h3>
                <p className="text-sm text-muted-foreground/60 mt-2 max-w-xs">
                  Upload a CSV file with your hotspot ticket data to get started
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground">
                  Ticket Preview
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({tickets.length} tickets)
                  </span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-4">
                {tickets.map((ticket, index) => (
                  <div key={index} className="ticket-container">
                    <TicketCard ticket={ticket} config={config} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="hidden print-only">
        {tickets.map((ticket, index) => (
          <div
            key={index}
            className={`ticket-container ${
              (index + 1) % (config.ticketsPerPage || 12) === 0 ? "ticket-page-break" : ""
            }`}
            style={{ display: "inline-block", margin: "4px" }}
          >
            <TicketCard ticket={ticket} config={config} />
          </div>
        ))}
      </div>

      <Toaster />
    </div>
  );
}

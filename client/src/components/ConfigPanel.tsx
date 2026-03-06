import { useState, useEffect } from "react";
import { useConfig, useUpdateConfig } from "@/hooks/use-config";
import { Settings, Save, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ConfigPanel() {
  const { data: config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    if (config) {
      setFormData({
        wifiName: config.wifiName || "",
        subtitle: config.subtitle || "",
        supportText: config.supportText || "",
        footerText: config.footerText || "",
        footerTextRight: config.footerTextRight || "",
        ticketsPerPage: config.ticketsPerPage || 12,
        baseHost: config.baseHost || "",
        logoUrl: config.logoUrl || "",
        template: config.template || "modern",
        qrStyle: config.qrStyle || "classic",
        primaryColor: config.primaryColor || "#0ea5e9",
        textColor: config.textColor || "#0f172a",
        backgroundColor: config.backgroundColor || "#ffffff",
        borderRadius: config.borderRadius || 16,
        borderWidth: config.borderWidth || 2,
        fontSize: config.fontSize || 14,
        ticketWidth: config.ticketWidth || 350,
        ticketHeight: config.ticketHeight || 240,
      });
    }
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
    updateConfig.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Configuration Saved",
          description: "Your ticket template settings have been updated.",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

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

      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
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
          disabled={updateConfig.isPending}
          className="w-full mt-4 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {updateConfig.isPending ? (
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

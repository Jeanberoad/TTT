import type { TicketData } from "@/types/ticket";
import type { Configuration } from "@shared/schema";

interface TicketCardProps {
  ticket: TicketData;
  config: Configuration;
  index: number;
}

function getQrUrl(ticket: TicketData, config: Configuration) {
  if (ticket.qr_url && ticket.qr_url.trim() !== "") return ticket.qr_url;
  if (config.baseHost) {
    const host = config.baseHost.endsWith('/') ? config.baseHost.slice(0, -1) : config.baseHost;
    const url = `${host}/login?username=${encodeURIComponent(ticket.username)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.username)}`;
}

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
  const accentColor = config.primaryColor || "#d4af37"; // Gold default for premium
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
      {/* Decorative motifs */}
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

export function TicketCard({ ticket, config, index }: TicketCardProps) {
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

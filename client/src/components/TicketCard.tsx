import type { TicketData } from "@/types/ticket";
import type { Configuration } from "@shared/schema";

interface TicketCardProps {
  ticket: TicketData;
  config: Configuration;
  index: number;
}

function getQrUrl(ticket: TicketData, config: Configuration) {
  if (ticket.qr_url) return ticket.qr_url;
  if (config.baseHost) {
    const url = `${config.baseHost}/login?username=${ticket.username}`;
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
          <img src={config.logoUrl} className="w-7 h-7 object-contain rounded" alt="Logo" />
        )}
        <div>
          <p className="font-bold text-white leading-tight text-sm">{config.wifiName || "WiFi Network"}</p>
          {config.subtitle && <p className="text-white/80 text-[10px]">{config.subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-1 p-3 gap-3">
        <div className="flex-1 flex flex-col gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: config.primaryColor }}>Username</p>
            <p className="font-mono font-bold text-sm">{ticket.username}</p>
          </div>
          {ticket.password && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: config.primaryColor }}>Password</p>
              <p className="font-mono font-bold text-sm">{ticket.password}</p>
            </div>
          )}
          {ticket.profile && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: config.primaryColor }}>Plan</p>
              <p className="text-sm font-medium">{ticket.profile}</p>
            </div>
          )}
          {ticket.limit_uptime && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: config.primaryColor }}>Duration</p>
              <p className="text-sm font-medium">{ticket.limit_uptime}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          <img
            src={qrUrl}
            alt="QR Code"
            className="w-20 h-20 object-contain"
            style={{
              borderRadius: config.qrStyle === "round" ? 8 : 0,
              border: config.qrStyle === "bordered" ? `2px solid ${config.primaryColor}` : "none",
              padding: config.qrStyle === "bordered" ? 2 : 0,
            }}
          />
        </div>
      </div>

      {(config.footerText || config.supportText || config.footerTextRight) && (
        <div
          className="px-3 py-1.5 flex justify-between items-center text-[9px]"
          style={{ backgroundColor: `${config.primaryColor}15`, borderTop: `1px solid ${config.primaryColor}30` }}
        >
          <span>{config.supportText}</span>
          <span>{config.footerText}</span>
          <span>{config.footerTextRight}</span>
        </div>
      )}
    </div>
  );
}

function MinimalistTicket({ ticket, config, qrUrl }: { ticket: TicketData; config: Configuration; qrUrl: string }) {
  return (
    <div
      className="ticket-card-content relative overflow-hidden"
      style={{
        width: config.ticketWidth || 350,
        minHeight: config.ticketHeight || 240,
        backgroundColor: config.backgroundColor || "#ffffff",
        borderRadius: config.borderRadius || 16,
        border: `${config.borderWidth || 1}px solid #e2e8f0`,
        fontSize: config.fontSize || 14,
        color: config.textColor || "#0f172a",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div className="p-4 flex gap-3 h-full">
        <div className="flex flex-col justify-between flex-1">
          <div>
            <p className="font-display font-bold text-base">{config.wifiName || "WiFi Network"}</p>
            {config.subtitle && <p className="text-xs text-muted-foreground">{config.subtitle}</p>}
          </div>
          <div className="space-y-1 mt-3">
            <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
              <span className="text-muted-foreground">user: </span>{ticket.username}
            </p>
            {ticket.password && (
              <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                <span className="text-muted-foreground">pass: </span>{ticket.password}
              </p>
            )}
            {ticket.profile && (
              <p className="text-xs px-2 py-0.5 rounded-full inline-block" style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}>
                {ticket.profile}
              </p>
            )}
          </div>
          {config.footerText && <p className="text-[10px] text-muted-foreground mt-2">{config.footerText}</p>}
        </div>
        <div className="flex items-center">
          <img src={qrUrl} alt="QR" className="w-20 h-20" />
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
        className="w-16 flex flex-col items-center justify-center p-3"
        style={{ backgroundColor: config.primaryColor || "#0ea5e9" }}
      >
        {config.logoUrl ? (
          <img src={config.logoUrl} className="w-10 h-10 object-contain" alt="Logo" />
        ) : (
          <span className="text-white font-bold text-xs text-center leading-tight">{config.wifiName?.substring(0, 6) || "WiFi"}</span>
        )}
      </div>
      <div className="flex-1 flex items-center px-4 gap-4">
        <div className="flex-1 space-y-1">
          <p className="font-bold text-sm">{config.wifiName || "WiFi"}</p>
          <p className="text-xs font-mono"><span className="text-muted-foreground">user: </span>{ticket.username}</p>
          {ticket.password && <p className="text-xs font-mono"><span className="text-muted-foreground">pass: </span>{ticket.password}</p>}
          {ticket.profile && <p className="text-xs" style={{ color: config.primaryColor }}>{ticket.profile}</p>}
        </div>
        <img src={qrUrl} alt="QR" className="w-16 h-16" />
      </div>
    </div>
  );
}

export function TicketCard({ ticket, config, index }: TicketCardProps) {
  const qrUrl = getQrUrl(ticket, config);

  if (config.template === "minimalist") {
    return <MinimalistTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
  }

  if (config.template === "horizontal") {
    return <HorizontalTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
  }

  return <ModernTicket ticket={ticket} config={config} qrUrl={qrUrl} />;
}

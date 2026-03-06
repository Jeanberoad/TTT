import { useState } from "react";
import { Printer, Download, Wifi, Tickets } from "lucide-react";
import { CsvUploader } from "@/components/CsvUploader";
import { TicketCard } from "@/components/TicketCard";
import { ConfigPanel } from "@/components/ConfigPanel";
import { useConfig } from "@/hooks/use-config";
import type { TicketData } from "@/types/ticket";

export default function Home() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const { data: config, isLoading } = useConfig();

  const handlePrint = () => {
    window.print();
  };

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

            <ConfigPanel />
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
                  config && (
                    <div key={index} className="ticket-container">
                      <TicketCard ticket={ticket} config={config} index={index} />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="hidden print-only">
        {config && tickets.map((ticket, index) => (
          <div
            key={index}
            className={`ticket-container ${
              (index + 1) % (config.ticketsPerPage || 12) === 0 ? "ticket-page-break" : ""
            }`}
            style={{ display: "inline-block", margin: "4px" }}
          >
            <TicketCard ticket={ticket} config={config} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}

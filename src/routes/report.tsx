import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/heritage/TopBar";
import { Panel } from "@/components/heritage/Panel";
import { CheckCircle2, AlertTriangle, Download, ShieldAlert, Wrench } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRef, useState } from "react";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Half-Yearly Heritage Report — Taj Heritage Command" }] }),
  component: ReportPage,
});

function ReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const downloadReport = () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with automatic page breaks
      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, contentWidth);
        
        // Check if content fits on current page
        const lineHeight = fontSize * 0.35;
        const totalHeight = lines.length * lineHeight;
        
        if (yPosition + totalHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(lines, margin, yPosition);
        yPosition += totalHeight + 2;
        return yPosition;
      };

      // Helper function to add section title
      const addSectionTitle = (title: string) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, yPosition);
        yPosition += 8;
      };

      // Helper function to add bullet points
      const addBulletPoints = (points: string[]) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        points.forEach((point) => {
          const lineHeight = 10 * 0.35;
          const lines = doc.splitTextToSize(`• ${point}`, contentWidth - 5);
          const totalHeight = lines.length * lineHeight;
          
          if (yPosition + totalHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          
          doc.text(lines, margin + 3, yPosition);
          yPosition += totalHeight + 1;
        });
      };

      // ===== HEADER SECTION =====
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("ARCHAEOLOGICAL SURVEY OF INDIA · HERITAGE COMMAND", margin, yPosition);
      yPosition += 7;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Half-Yearly Heritage Report", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Taj Mahal Complex · Agra · H1 FY 2025–26", margin, yPosition);
      yPosition += 12;

      // ===== METRICS SECTION =====
      doc.setFontSize(9);
      const metricsData = [
        ["Reporting Period", "Apr – Sep 2025"],
        ["Visitors Logged", "2,184,930"],
        ["Incidents Resolved", "1,247"],
        ["Preservation Index", "87.4 / 100"],
      ];

      metricsData.forEach(([label, value]) => {
        doc.setFont("helvetica", "normal");
        doc.text(label + ":", margin, yPosition);
        doc.setFont("helvetica", "bold");
        doc.text(value, margin + 50, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // ===== QUARTERLY REPORT CARD TABLE =====
      addSectionTitle("Quarterly Report Card");

      const tableData = [
        ["Visitors", "1,021K", "1,164K", "▲"],
        ["Avg AQI", "112", "97", "▼"],
        ["Incidents", "684", "563", "▼"],
        ["Critical Alerts", "21", "12", "▼"],
        ["Maintenance Hrs", "412", "498", "▲"],
        ["Preservation Index", "88.1", "87.4", "▼"],
      ];

      autoTable(doc, {
        head: [["METRIC", "Q1", "Q2", "Trend"]],
        body: tableData,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          fontStyle: "bold",
          textColor: [0, 0, 0],
          fillColor: [200, 200, 200],
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;

      // ===== DEGRADATION SUMMARY =====
      addSectionTitle("Degradation Summary");
      const degradationPoints = [
        "Marble yellowing observed on the southern facade due to elevated SO₂ exposure during May.",
        "Minor mortar erosion detected at the eastern minaret base after July monsoon.",
        "Inlay restoration in mausoleum hall progressing on schedule (78% complete).",
        "Reflecting pool tile discoloration linked to algae bloom during humid weeks.",
      ];
      addBulletPoints(degradationPoints);

      // ===== CROWD STRESS SUMMARY =====
      addSectionTitle("Crowd Stress Summary");
      const crowdPoints = [
        "Peak load 19,420 visitors recorded on Eid weekend (97% capacity).",
        "3 congestion events at the Great Gate exceeded 4 minute clearance threshold.",
        "Average dwell time decreased 11% after revised one-way pathway introduced in June.",
      ];
      addBulletPoints(crowdPoints);

      // ===== WEATHER IMPACT SUMMARY =====
      addSectionTitle("Weather Impact Summary");
      const weatherPoints = [
        "42 high-humidity days (>80%) accelerated micro-fungal growth on north corridor.",
        "Dust storm on 12 June reduced visibility to 180m for 4 hours; 1 patrol unit re-routed.",
        "Air purifier ring around mausoleum cut local PM2.5 by 38%.",
      ];
      addBulletPoints(weatherPoints);

      // ===== SECURITY INCIDENT SUMMARY =====
      addSectionTitle("Security Incident Summary");
      const securityMetrics = [
        ["Restricted Breaches", "14"],
        ["Suspicious Gatherings", "38"],
        ["Resolved < 5 min", "92%"],
        ["False Positives", "6.4%"],
      ];

      doc.setFontSize(9);
      securityMetrics.forEach(([label, value], idx) => {
        doc.setFont("helvetica", "normal");
        doc.text(`${label}:`, margin, yPosition);
        doc.setFont("helvetica", "bold");
        doc.text(value, margin + 50, yPosition);
        yPosition += 5;
        if ((idx + 1) % 2 === 0) yPosition += 1;
      });

      yPosition += 3;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const securityNote = "All restricted area breaches were contained without artifact damage. Average response time across all units improved by 22% versus previous half-year.";
      const noteLines = doc.splitTextToSize(securityNote, contentWidth);
      doc.text(noteLines, margin, yPosition);
      yPosition += noteLines.length * 4 + 5;

      // ===== RECOMMENDATIONS & PREVENTIVE ACTIONS =====
      addSectionTitle("Recommendations & Preventive Actions");
      const recommendations = [
        "Install additional dehumidification units in the mausoleum chamber before next monsoon.",
        "Extend the 500m emission-restricted buffer zone around the complex to include the eastern industrial corridor.",
        "Deploy two additional patrol units (Foxtrot, Golf) to cover river-edge blind spots identified by CAM-10.",
        "Schedule a half-day mock-drill per quarter for medical and lost-child response.",
        "Replace the 11 oldest analog cameras with neural-edge units capable of on-device anomaly detection.",
        "Begin pilot of timed-entry slots during Oct–Dec festival season to cap peak crowd density.",
      ];
      addBulletPoints(recommendations);

      // ===== MAINTENANCE SUGGESTIONS =====
      addSectionTitle("Maintenance Suggestions");
      const maintenance = [
        "Mud-pack therapy on south facade — schedule for late October when humidity drops below 55%.",
        "Replace pump impellers in reflecting pool circulation system (vendor quote received).",
        "Re-paint all directional signage with low-VOC paint by end of Q3.",
        "Inspect and seal expansion joints on Great Gate marble flooring before next monsoon.",
      ];
      addBulletPoints(maintenance);

      // ===== FOOTER =====
      yPosition += 8;
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const footer = "Document classification: ASI-INTERNAL · Generated by Heritage Command System v2.4.1";
      doc.text(footer, margin, pageHeight - 8, { align: "center" });

      // Save PDF
      doc.save("Taj_Mahal_Half_Yearly_Report_H1_FY_2025_26.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      alert("PDF export failed: " + errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <TopBar />
      <div ref={reportRef} className="report-export-root mx-auto w-full max-w-[1400px] px-4 py-6 flex-1 overflow-y-auto space-y-4">
        <div className="glass corner-frame rounded-md p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-cyan">ARCHAEOLOGICAL SURVEY OF INDIA · HERITAGE COMMAND</div>
              <h1 className="text-3xl font-bold neon-text mt-1">Half-Yearly Heritage Report</h1>
              <div className="text-sm text-muted-foreground mt-1">Taj Mahal Complex · Agra · H1 FY 2025–26</div>
            </div>

            <button
              onClick={downloadReport}
              disabled={isExporting}
              data-export-ignore="true"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-400/40 bg-slate-900/70 text-cyan-300 font-mono text-xs tracking-widest hover:bg-cyan-500/10 transition-all"
            >
              <Download className="size-4" />
              {isExporting ? "EXPORTING..." : "DOWNLOAD REPORT"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-4 text-xs md:grid-cols-2 xl:grid-cols-4">
            <div><div className="text-muted-foreground">Reporting Period</div><div className="text-cyan">Apr – Sep 2025</div></div>
            <div><div className="text-muted-foreground">Visitors Logged</div><div className="text-cyan tabular-nums">2,184,930</div></div>
            <div><div className="text-muted-foreground">Incidents Resolved</div><div className="text-cyan tabular-nums">1,247</div></div>
            <div><div className="text-muted-foreground">Preservation Index</div><div className="text-safe tabular-nums">87.4 / 100</div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Panel title="Quarterly Report Card" className="break-inside-avoid page-break-inside-avoid !p-4">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground text-[10px] tracking-widest">
                <tr><th className="text-left py-1">METRIC</th><th>Q1</th><th>Q2</th><th>Trend</th></tr>
              </thead>
              <tbody className="tabular-nums">
                {[
                  ["Visitors", "1,021K", "1,164K", "▲"],
                  ["Avg AQI", "112", "97", "▼"],
                  ["Incidents", "684", "563", "▼"],
                  ["Critical Alerts", "21", "12", "▼"],
                  ["Maintenance Hrs", "412", "498", "▲"],
                  ["Preservation Index", "88.1", "87.4", "▼"],
                ].map(r => (
                  <tr key={r[0]} className="border-t border-white/5">
                    <td className="py-1 text-muted-foreground">{r[0]}</td>
                    <td className="text-center">{r[1]}</td>
                    <td className="text-center">{r[2]}</td>
                    <td className="text-center text-cyan">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Degradation Summary" className="break-inside-avoid page-break-inside-avoid !p-4">
            <ul className="text-xs space-y-2">
              <Item tone="warn" text="Marble yellowing observed on the southern facade due to elevated SO₂ exposure during May." />
              <Item tone="danger" text="Minor mortar erosion detected at the eastern minaret base after July monsoon." />
              <Item tone="safe" text="Inlay restoration in mausoleum hall progressing on schedule (78% complete)." />
              <Item tone="warn" text="Reflecting pool tile discoloration linked to algae bloom during humid weeks." />
            </ul>
          </Panel>

          <Panel title="Crowd Stress Summary" className="break-inside-avoid page-break-inside-avoid !p-4">
            <ul className="text-xs space-y-2">
              <Item tone="warn" text="Peak load 19,420 visitors recorded on Eid weekend (97% capacity)." />
              <Item tone="danger" text="3 congestion events at the Great Gate exceeded 4 minute clearance threshold." />
              <Item tone="safe" text="Average dwell time decreased 11% after revised one-way pathway introduced in June." />
            </ul>
          </Panel>

          <Panel title="Weather Impact Summary" className="break-inside-avoid page-break-inside-avoid !p-4">
            <ul className="text-xs space-y-2">
              <Item tone="warn" text="42 high-humidity days (>80%) accelerated micro-fungal growth on north corridor." />
              <Item tone="danger" text="Dust storm on 12 June reduced visibility to 180m for 4 hours; 1 patrol unit re-routed." />
              <Item tone="safe" text="Air purifier ring around mausoleum cut local PM2.5 by 38%." />
            </ul>
          </Panel>

          <Panel title="Security Incident Summary" className="col-span-1 xl:col-span-2 break-inside-avoid page-break-inside-avoid !p-4">
            <div className="grid grid-cols-4 gap-3 text-xs">
              <Tile icon={<ShieldAlert className="size-4 text-danger" />} label="Restricted Breaches" value="14" />
              <Tile icon={<AlertTriangle className="size-4 text-warn" />} label="Suspicious Gatherings" value="38" />
              <Tile icon={<CheckCircle2 className="size-4 text-safe" />} label="Resolved < 5 min" value="92%" />
              <Tile icon={<Wrench className="size-4 text-cyan" />} label="False Positives" value="6.4%" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              All restricted area breaches were contained without artifact damage. Average response time across all units improved by 22% versus previous half-year.
            </div>
          </Panel>

          <Panel title="Recommendations & Preventive Actions" className="col-span-1 xl:col-span-2 break-inside-avoid page-break-inside-avoid !p-4">
            <ol className="text-xs space-y-2 list-decimal pl-5">
              <li>Install additional dehumidification units in the mausoleum chamber before next monsoon.</li>
              <li>Extend the 500m emission-restricted buffer zone around the complex to include the eastern industrial corridor.</li>
              <li>Deploy two additional patrol units (Foxtrot, Golf) to cover river-edge blind spots identified by CAM-10.</li>
              <li>Schedule a half-day mock-drill per quarter for medical and lost-child response.</li>
              <li>Replace the 11 oldest analog cameras with neural-edge units capable of on-device anomaly detection.</li>
              <li>Begin pilot of timed-entry slots during Oct–Dec festival season to cap peak crowd density.</li>
            </ol>
          </Panel>

          <Panel title="Maintenance Suggestions" className="col-span-1 xl:col-span-2 break-inside-avoid page-break-inside-avoid !p-4">
            <ul className="text-xs space-y-1.5">
              <Item tone="cyan" text="Mud-pack therapy on south facade — schedule for late October when humidity drops below 55%." />
              <Item tone="cyan" text="Replace pump impellers in reflecting pool circulation system (vendor quote received)." />
              <Item tone="cyan" text="Re-paint all directional signage with low-VOC paint by end of Q3." />
              <Item tone="cyan" text="Inspect and seal expansion joints on Great Gate marble flooring before next monsoon." />
            </ul>
          </Panel>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pb-4">
          Document classification: ASI-INTERNAL · Generated by Heritage Command System v2.4.1
        </div>
      </div>
    </div>
  );
}

function Item({ tone, text }: { tone: "warn" | "danger" | "safe" | "cyan"; text: string }) {
  const c = tone === "warn" ? "text-warn" : tone === "danger" ? "text-danger" : tone === "safe" ? "text-safe" : "text-cyan";
  return (
    <li className="flex gap-2">
      <span className={`mt-1 size-1.5 rounded-full shrink-0 ${tone === "warn" ? "bg-warn" : tone === "danger" ? "bg-danger" : tone === "safe" ? "bg-safe" : "bg-cyan"}`} />
      <span><span className={`${c} font-semibold`}>•</span> {text}</span>
    </li>
  );
}
function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-black/30 p-3">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground tracking-widest">{icon}{label}</div>
      <div className="text-2xl font-bold neon-text mt-1 tabular-nums">{value}</div>
    </div>
  );
}

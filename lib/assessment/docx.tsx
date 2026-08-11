import "server-only";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { DIM_LABELS, BAND_LABELS } from "./report";
import type { ReportPdfData } from "./pdf";
import type { DimensionKey } from "./scoring";

/**
 * Editable DOCX twin of the report PDF — same content, Word format, so the team
 * can tweak it before sending. Not pixel-identical to the PDF (different
 * format), but section-for-section the same. Renders from the same
 * ReportPdfData + AI content as lib/assessment/pdf.tsx.
 */

const NAVY = "0D1B2A";
const GOLD = "9A7B1F"; // darker gold — readable on white in Word
const INK = "1B2733";
const BODY = "45535F";

const CANONICAL: DimensionKey[] = [
  "data_crm",
  "documented_process",
  "proposals",
  "response_speed",
  "ai_maturity",
];

function h1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, color: INK, size: 32 })],
  });
}

function para(runs: TextRun[], opts: { spacing?: number } = {}): Paragraph {
  return new Paragraph({ spacing: { after: opts.spacing ?? 120 }, children: runs });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}  `, color: "7E8FA0", size: 20 }),
      new TextRun({ text: value, bold: true, color: INK, size: 20 }),
    ],
  });
}

function bullet(runs: TextRun[]): Paragraph {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: runs });
}

export async function renderReportDocx(data: ReportPdfData): Promise<Buffer> {
  const { meta, locale, score, content } = data;
  const en = locale === "en";
  const bandLabel = BAND_LABELS[score.band][locale];
  const valueByKey = new Map(score.dimensions.map((d) => [d.key, d.value] as const));

  const L = {
    eyebrow: "AI FREE ASSESSMENT",
    coverTitle: en ? "Your AI diagnostic for sales" : "Tu diagnóstico de IA para ventas",
    preparedFor: en ? "Prepared for" : "Preparado para",
    company: en ? "Company" : "Empresa",
    date: en ? "Date" : "Fecha",
    preparedBy: en ? "Prepared by" : "Preparado por",
    execSummary: en ? "Executive summary" : "Resumen ejecutivo",
    scoreLabel: en ? "AI Sales Readiness Score" : "AI Sales Readiness Score",
    nivel: en ? "Level" : "Nivel",
    costLead: en ? "What this is costing you today: " : "Lo que esto te está costando hoy: ",
    findingsTitle: en ? "The 3 main findings" : "Los 3 hallazgos principales",
    byArea: en ? "Diagnosis by area" : "Diagnóstico por área",
    costInline: en ? "What it costs you: " : "Qué te cuesta: ",
    oppTitle: en ? "Your 3 biggest opportunities" : "Tus 3 mayores oportunidades",
    problem: en ? "The problem: " : "El problema: ",
    aiCan: en ? "What AI can do: " : "Lo que la IA puede hacer: ",
    impact: en ? "Expected impact: " : "Impacto esperado: ",
    solution: en ? "SOLUTION: " : "SOLUCIÓN: ",
    firstStep: en ? "This is just the first step" : "Este es solo el primer paso",
    planTitle: en ? "Your starting plan" : "Tu plan de arranque",
    quickWins: en ? "Quick wins (2–3 weeks)" : "Ganancias rápidas (2–3 semanas)",
    deepProjects: en ? "Strategic projects" : "Proyectos de fondo",
    nextStep: en ? "Next step: full AI Opportunity Assessment" : "Siguiente paso: AI Opportunity Assessment completo",
    nextStepBody: en
      ? "Two weeks. A real diagnostic of your processes. An actionable plan with the 3–5 highest-impact opportunities — prioritized, with the route to implement them."
      : "Dos semanas. Un diagnóstico real de tus procesos. Un plan accionable con las 3–5 oportunidades de mayor impacto — priorizadas y con la ruta de cómo implementarlas.",
    price: "desde $8,000 MXN · oferta por tiempo limitado",
    cta: "itzam.ai/contact",
    freeCol: "AI Free Assessment",
    fullCol: "AI Opportunity Assessment",
    whyTitle: en ? "Why take the step?" : "¿Por qué dar el paso?",
  };

  const cmp: [string, string, string][] = en
    ? [
        ["Format", "Automatic online questionnaire", "2 calls + in-depth analysis with your team"],
        ["Duration", "Instant", "2 weeks"],
        ["Scope", "High-level general diagnostic", "Detailed mapping of your real processes"],
        ["Opportunities", "The main ones, orientative", "3–5 prioritized, with impact and effort"],
        ["Deliverable", "This report (preview)", "10–12 page report + actionable plan"],
        ["Implementation plan", "—", "Clear route of what to automate first and how"],
        ["Cost", "Free", "from $8,000 MXN · limited-time offer"],
      ]
    : [
        ["Formato", "Cuestionario online automático", "2 llamadas + análisis a profundidad con tu equipo"],
        ["Duración", "Inmediato", "2 semanas"],
        ["Alcance", "Diagnóstico general a alto nivel", "Mapeo detallado de tus procesos reales"],
        ["Oportunidades", "Las principales, orientativas", "3–5 priorizadas, con impacto y esfuerzo"],
        ["Entregable", "Este reporte (adelanto)", "Reporte de 10–12 páginas + plan accionable"],
        ["Plan de implementación", "—", "Ruta clara de qué automatizar primero y cómo"],
        ["Costo", "Gratis", "desde $8,000 MXN · oferta por tiempo limitado"],
      ];
  const why: [string, string][] = en
    ? [
        ["Clarity to decide: ", "you stop guessing what to automate first and have a plan with priorities."],
        ["No endless-project risk: ", "it's 2 weeks, not 6 months. If you decide not to continue, the diagnostic is yours."],
        ["Fast return: ", "the first automations usually pay for themselves in recovered team hours."],
      ]
    : [
        ["Claridad para decidir: ", "dejas de adivinar qué automatizar primero y tienes un plan con prioridades."],
        ["Sin riesgo de un proyecto eterno: ", "son 2 semanas, no 6 meses. Si al final decides no seguir, te quedas con el diagnóstico."],
        ["Retorno rápido: ", "las primeras automatizaciones suelen pagarse solas en horas recuperadas del equipo."],
      ];

  const children: (Paragraph | Table)[] = [];

  // Cover
  children.push(
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: L.eyebrow, bold: true, color: "3E93B0", size: 20 })] }),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: L.coverTitle, bold: true, color: INK, size: 44 })] }),
    para([new TextRun({ text: content.subtitle, color: BODY, size: 24 })], { spacing: 240 }),
    labelValue(L.preparedFor, `${meta.fullName} — ${meta.role}`),
    labelValue(L.company, `${meta.company}${meta.industry ? ` (${meta.industry})` : ""}`),
    labelValue(L.date, meta.dateStr),
    labelValue(L.preparedBy, "Itzam.AI · itzam.ai · contact@itzam.ai")
  );

  // Executive summary
  children.push(h1(L.execSummary));
  for (const p of content.exec_intro.slice(0, 2)) {
    children.push(para([new TextRun({ text: p, color: BODY, size: 22 })]));
  }
  children.push(
    para([
      new TextRun({ text: `${L.scoreLabel}: `, color: "7E8FA0", size: 22 }),
      new TextRun({ text: `${score.score}/100`, bold: true, color: GOLD, size: 26 }),
      new TextRun({ text: `   ${L.nivel}: ${bandLabel}`, bold: true, color: INK, size: 22 }),
    ])
  );
  children.push(para([new TextRun({ text: content.score_blurb, color: BODY, size: 22 })]));
  children.push(
    para([
      new TextRun({ text: L.costLead, bold: true, color: INK, size: 22 }),
      new TextRun({ text: content.cost_callout, color: BODY, size: 22 }),
    ])
  );
  children.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: L.findingsTitle, bold: true, color: INK, size: 24 })] }));
  for (const f of content.findings.slice(0, 3)) {
    children.push(
      bullet([
        new TextRun({ text: `${f.title} `, bold: true, color: INK, size: 22 }),
        new TextRun({ text: f.body, color: BODY, size: 22 }),
      ])
    );
  }

  // Diagnosis by area
  children.push(h1(L.byArea));
  for (const key of CANONICAL) {
    const value = valueByKey.get(key) ?? 0;
    const note = content.dimensions[key];
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: DIM_LABELS[key][locale], bold: true, color: INK, size: 22 }),
          new TextRun({ text: `   ${value}/100 · ${note.status}`, color: GOLD, size: 20 }),
        ],
      }),
      para([
        new TextRun({ text: `${note.observation} `, color: BODY, size: 22 }),
        new TextRun({ text: L.costInline, bold: true, color: INK, size: 22 }),
        new TextRun({ text: note.cost, color: BODY, size: 22 }),
      ])
    );
  }

  // Opportunities
  children.push(h1(L.oppTitle));
  for (const o of content.opportunities.slice(0, 3)) {
    children.push(
      new Paragraph({ spacing: { before: 140, after: 40 }, children: [new TextRun({ text: o.title, bold: true, color: INK, size: 24 })] }),
      para([new TextRun({ text: L.problem, bold: true, color: INK, size: 22 }), new TextRun({ text: o.problem, color: BODY, size: 22 })], { spacing: 60 }),
      para([new TextRun({ text: L.aiCan, bold: true, color: INK, size: 22 }), new TextRun({ text: o.ai_can_do, color: BODY, size: 22 })], { spacing: 60 }),
      para([new TextRun({ text: L.impact, bold: true, color: INK, size: 22 }), new TextRun({ text: o.impact, color: BODY, size: 22 })], { spacing: 60 }),
      para([new TextRun({ text: `${L.solution}${o.solution}`, bold: true, color: GOLD, size: 22 })])
    );
  }

  // First step + comparison table
  children.push(h1(L.firstStep));
  const cell = (text: string, opts: { bold?: boolean; color?: string; fill?: string } = {}) =>
    new TableCell({
      shading: opts.fill ? { fill: opts.fill, color: "auto", type: "clear" } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text, bold: opts.bold, color: opts.color ?? BODY, size: 20 })] })],
    });
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: "E2E6EA" },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "E2E6EA" },
        left: { style: BorderStyle.SINGLE, size: 2, color: "E2E6EA" },
        right: { style: BorderStyle.SINGLE, size: 2, color: "E2E6EA" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E6EA" },
        insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E2E6EA" },
      },
      rows: [
        new TableRow({
          children: [
            cell("", { fill: NAVY }),
            cell(L.freeCol, { bold: true, color: "FFFFFF", fill: NAVY }),
            cell(L.fullCol, { bold: true, color: "E8C979", fill: NAVY }),
          ],
        }),
        ...cmp.map(
          (r) =>
            new TableRow({
              children: [cell(r[0], { bold: true, color: INK }), cell(r[1]), cell(r[2], { fill: "FAF6EC" })],
            })
        ),
      ],
    }),
    new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text: L.whyTitle, bold: true, color: INK, size: 24 })] })
  );
  for (const w of why) {
    children.push(bullet([new TextRun({ text: w[0], bold: true, color: INK, size: 22 }), new TextRun({ text: w[1], color: BODY, size: 22 })]));
  }

  // Starting plan + CTA
  children.push(h1(L.planTitle));
  children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: L.quickWins, bold: true, color: "3F9E63", size: 22 })] }));
  for (const q of content.quick_wins.slice(0, 3)) children.push(bullet([new TextRun({ text: q, color: BODY, size: 22 })]));
  children.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: L.deepProjects, bold: true, color: "3E93B0", size: 22 })] }));
  for (const q of content.strategic_projects.slice(0, 3)) children.push(bullet([new TextRun({ text: q, color: BODY, size: 22 })]));
  children.push(
    new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: L.nextStep, bold: true, color: GOLD, size: 24 })] }),
    para([new TextRun({ text: L.nextStepBody, color: BODY, size: 22 })]),
    para([
      new TextRun({ text: `${L.price}  ·  `, bold: true, color: INK, size: 22 }),
      new TextRun({ text: L.cta, bold: true, color: GOLD, size: 22 }),
    ])
  );

  const doc = new Document({
    creator: "Itzam.AI",
    title: `AI Free Assessment — ${meta.company}`,
    sections: [{ properties: {}, children }],
  });
  return Packer.toBuffer(doc) as Promise<Buffer>;
}

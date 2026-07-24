import "server-only";

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ReportContent } from "./report";
import { DIM_LABELS, BAND_LABELS, dimensionColor } from "./report";
import type { ScoreResult, DimensionKey } from "./scoring";

/**
 * Fixed 6-page "AI Free Assessment" report template, matching
 * Itzam_MiniAssessment_Reporte_EJEMPLO.pdf. The layout is entirely in code —
 * Claude only supplies the prose in `content` — so the format costs no tokens.
 */

const NAVY = "#0D1B2A";
const NAVY2 = "#12283F";
const GOLD = "#C9A84C";
const BLUE = "#3E93B0";
const CREAM = "#FAF6EC";
const INK = "#1B2733";
const BODY = "#45535F";
const MUTED = "#8A94A0";
const LINE = "#E2E6EA";

const CANONICAL: DimensionKey[] = [
  "data_crm",
  "playbook",
  "proposals",
  "response_speed",
  "ai_maturity",
];

const s = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", fontFamily: "Helvetica", color: BODY, fontSize: 10.5, lineHeight: 1.5 },
  cover: { backgroundColor: NAVY, color: "#FFFFFF", padding: 54, height: "100%" },
  band: {
    backgroundColor: NAVY,
    paddingVertical: 16,
    paddingHorizontal: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bandEyebrow: { color: "#9FB0C0", fontSize: 8, letterSpacing: 2 },
  content: { paddingHorizontal: 48, paddingTop: 22, paddingBottom: 54 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  logoBars: { width: 20, justifyContent: "center", gap: 2.5 },
  logoBar: { height: 2.5, backgroundColor: GOLD, borderRadius: 2 },
  logoText: { fontFamily: "Helvetica-Bold", fontSize: 15, color: "#FFFFFF" },
  logoTextSm: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#FFFFFF" },

  h1: { fontFamily: "Helvetica-Bold", fontSize: 22, color: INK, marginBottom: 4 },
  rule: { width: 46, height: 3, backgroundColor: GOLD, borderRadius: 2, marginBottom: 12, marginTop: 5 },
  p: { color: BODY, marginBottom: 7 },
  bold: { fontFamily: "Helvetica-Bold", color: INK },

  eyebrow: { color: BLUE, fontSize: 10, letterSpacing: 3, fontFamily: "Helvetica-Bold", marginBottom: 14 },
  coverTitle: { fontFamily: "Helvetica-Bold", fontSize: 40, lineHeight: 1.1, color: "#FFFFFF", marginBottom: 14 },
  coverSub: { color: "#B8C6D2", fontSize: 15, lineHeight: 1.4, maxWidth: 380 },
  coverDivider: { height: 1, backgroundColor: "#2A3B4C", marginVertical: 26 },
  metaRow: { flexDirection: "row", marginBottom: 9 },
  metaLabel: { color: "#7E8FA0", fontSize: 10.5, width: 110 },
  metaValue: { color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 10.5, flex: 1 },
  coverFoot: { color: "#5E7082", fontSize: 8.5, lineHeight: 1.4, marginTop: 40 },

  scoreCard: { backgroundColor: NAVY2, borderRadius: 10, padding: 16, flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 8 },
  scoreNum: { fontFamily: "Helvetica-Bold", fontSize: 38, color: GOLD },
  scoreSlash: { fontSize: 16, color: "#8FA0B0" },
  scoreLabelSm: { color: "#9FB0C0", fontSize: 8, letterSpacing: 1.5, marginBottom: 5 },
  scoreBand: { fontFamily: "Helvetica-Bold", fontSize: 14, color: GOLD, marginBottom: 4 },
  scoreBlurb: { color: "#C3D0DB", fontSize: 9.5, lineHeight: 1.4 },

  callout: { backgroundColor: CREAM, borderLeftWidth: 3, borderLeftColor: GOLD, borderRadius: 4, padding: 12, marginVertical: 10 },

  findingRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  bullet: { color: GOLD, fontFamily: "Helvetica-Bold" },

  dimBlock: { marginBottom: 15 },
  dimHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 5 },
  dimName: { fontFamily: "Helvetica-Bold", fontSize: 12, color: INK },
  dimStatus: { fontSize: 9.5 },
  track: { height: 6, backgroundColor: "#EDEFF2", borderRadius: 4, marginBottom: 6, overflow: "hidden" },
  fill: { height: 6, borderRadius: 4 },

  oppBlock: { borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 14, marginBottom: 16 },
  oppTitle: { fontFamily: "Helvetica-Bold", fontSize: 13, color: INK, marginBottom: 6 },
  pill: { backgroundColor: NAVY, color: GOLD, alignSelf: "flex-start", paddingVertical: 5, paddingHorizontal: 11, borderRadius: 5, fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 6 },

  table: { borderWidth: 1, borderColor: LINE, borderRadius: 6, overflow: "hidden", marginBottom: 18 },
  trHead: { flexDirection: "row", backgroundColor: NAVY },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: LINE },
  thLabel: { width: "26%", padding: 9, fontFamily: "Helvetica-Bold", color: "#FFFFFF", fontSize: 9 },
  th: { flex: 1, padding: 9, fontFamily: "Helvetica-Bold", color: "#FFFFFF", fontSize: 9 },
  thGold: { flex: 1, padding: 9, fontFamily: "Helvetica-Bold", color: GOLD, fontSize: 9 },
  tdLabel: { width: "26%", padding: 9, fontFamily: "Helvetica-Bold", color: INK, fontSize: 9.5, backgroundColor: "#FAFBFC" },
  td: { flex: 1, padding: 9, color: BODY, fontSize: 9.5 },
  tdGold: { flex: 1, padding: 9, color: "#6B5A2A", fontSize: 9.5, backgroundColor: CREAM },

  planCols: { flexDirection: "row", gap: 14, marginBottom: 20 },
  planCard: { flex: 1, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 16 },
  planHeadGreen: { color: "#3F9E63", fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 8 },
  planHeadBlue: { color: BLUE, fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 8 },
  ctaBox: { backgroundColor: NAVY, borderRadius: 12, padding: 26 },
  ctaTitle: { color: GOLD, fontFamily: "Helvetica-Bold", fontSize: 15, marginBottom: 8 },
  ctaBody: { color: "#C3D0DB", fontSize: 10, lineHeight: 1.5, marginBottom: 12 },
  ctaPrice: { color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 22 },
  ctaBtn: { backgroundColor: GOLD, color: NAVY, alignSelf: "flex-start", paddingVertical: 9, paddingHorizontal: 16, borderRadius: 6, fontFamily: "Helvetica-Bold", fontSize: 10, marginTop: 14, textDecoration: "none" },

  footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8 },
  footerText: { color: MUTED, fontSize: 8 },
});

function Logo({ small }: { small?: boolean }) {
  return (
    <View style={s.logoRow}>
      <View style={s.logoBars}>
        <View style={[s.logoBar, { width: small ? 14 : 20 }]} />
        <View style={[s.logoBar, { width: small ? 14 : 20 }]} />
        <View style={[s.logoBar, { width: small ? 14 : 20 }]} />
      </View>
      <Text style={small ? s.logoTextSm : s.logoText}>itzam.ai</Text>
    </View>
  );
}

function Band({ company }: { company: string }) {
  return (
    <View style={s.band}>
      <Logo small />
      <Text style={s.bandEyebrow}>AI FREE ASSESSMENT · {company.toUpperCase()}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Itzam.AI — AI Free Assessment</Text>
      <Text style={s.footerText} render={({ pageNumber }) => `Página ${pageNumber}`} />
    </View>
  );
}

export type ReportPdfData = {
  meta: { fullName: string; role: string; company: string; industry: string; dateStr: string };
  locale: "es" | "en";
  score: ScoreResult;
  content: ReportContent;
};

function ReportDoc({ meta, locale, score, content }: ReportPdfData) {
  const en = locale === "en";
  const valueByKey = new Map(score.dimensions.map((d) => [d.key, d.value] as const));
  const bandLabel = BAND_LABELS[score.band][locale];

  const T = {
    subtitleFallback: en
      ? "Where AI can generate the greatest impact in your commercial operation"
      : "Dónde la inteligencia artificial puede generar el mayor impacto en tu operación comercial",
    coverTitle: en ? "Your AI diagnostic\nfor sales" : "Tu diagnóstico de\nIA para ventas",
    preparedFor: en ? "Prepared for" : "Preparado para",
    company: en ? "Company" : "Empresa",
    date: en ? "Date" : "Fecha",
    preparedBy: en ? "Prepared by" : "Preparado por",
    disclaimer: en
      ? "Automatically generated from your AI Free Assessment and reviewed by the Itzam.AI team. It is an orientation diagnostic; the full AI Opportunity Assessment goes deeper on each point."
      : "Documento generado automáticamente a partir de tu AI Free Assessment y revisado por el equipo de Itzam.AI. Es un diagnóstico orientativo; el AI Opportunity Assessment completo profundiza en cada punto.",
    execSummary: en ? "Executive summary" : "Resumen ejecutivo",
    scoreLabel: "AI SALES READINESS SCORE",
    nivel: en ? "Level" : "Nivel",
    costLead: en ? "What this is costing you today: " : "Lo que esto te está costando hoy: ",
    findingsTitle: en ? "The 3 main findings" : "Los 3 hallazgos principales",
    byArea: en ? "Diagnosis by area" : "Diagnóstico por área",
    byAreaIntro: en
      ? "We evaluate five dimensions that determine how ready your operation is to capture value with AI. These are your bars — and what each means for your business."
      : "Evaluamos cinco dimensiones que determinan qué tan lista está tu operación para capturar valor con IA. Estas son tus barras — y lo que cada una significa para tu negocio.",
    costInline: en ? "What it costs you: " : "Qué te cuesta: ",
    oppTitle: en ? "Your 3 biggest opportunities" : "Tus 3 mayores oportunidades",
    oppIntro: en
      ? "Prioritized by impact and ease of implementation, mapped to concrete solutions."
      : "Priorizadas por impacto y facilidad de implementación, y mapeadas a soluciones concretas.",
    problem: en ? "The problem: " : "El problema: ",
    aiCan: en ? "What AI can do: " : "Lo que la IA puede hacer: ",
    impact: en ? "Expected impact: " : "Impacto esperado: ",
    solution: en ? "SOLUTION: " : "SOLUCIÓN: ",
    firstStep: en ? "This is just the first step" : "Este es solo el primer paso",
    firstStepIntro: en
      ? "This free diagnostic gives you the general map. The full AI Opportunity Assessment gets down to your reality: it analyzes your real processes, with your team, and hands you a plan you can execute immediately."
      : "Este diagnóstico gratuito te da el mapa general. El AI Opportunity Assessment completo baja a tu realidad: analiza tus procesos reales, con tu equipo, y te entrega un plan que puedes ejecutar de inmediato.",
    planTitle: en ? "Your starting plan" : "Tu plan de arranque",
    quickWins: en ? "QUICK WINS (2–3 WEEKS)" : "GANANCIAS RÁPIDAS (2–3 SEMANAS)",
    deepProjects: en ? "STRATEGIC PROJECTS" : "PROYECTOS DE FONDO",
    nextStep: en ? "Next step: full AI Opportunity Assessment" : "Siguiente paso: AI Opportunity Assessment completo",
    nextStepBody: en
      ? "Two weeks. A real diagnostic of your processes. An actionable plan with the 3–5 highest-impact opportunities — prioritized, with the route to implement them. No consultants installed, no endless projects."
      : "Dos semanas. Un diagnóstico real de tus procesos. Un plan accionable con las 3–5 oportunidades de mayor impacto — priorizadas y con la ruta de cómo implementarlas. Sin consultores instalados, sin proyectos interminables.",
    price: "desde $8,000 MXN",
    priceNote: en ? " · limited-time offer" : " · oferta por tiempo limitado",
    payNote: en
      ? "50% upfront, 50% on delivery. If you decide not to continue, the diagnostic is yours."
      : "Pago 50% al inicio, 50% a la entrega. Si decides no continuar, el diagnóstico es tuyo.",
    ctaBtn: en ? "Book your Assessment  →  itzam.ai/contact" : "Agenda tu Assessment  →  itzam.ai/contact",
    contactLine: en
      ? "Questions? Write to contact@itzam.ai. We'll gladly review this diagnostic together in a no-commitment 20-minute call."
      : "¿Preguntas? Escríbenos a contact@itzam.ai. Con gusto revisamos juntos este diagnóstico en una llamada de 20 minutos, sin compromiso.",
  };

  // Static comparison table rows (page 5).
  const cmp: { label: string; free: string; full: string }[] = en
    ? [
        { label: "Format", free: "Automatic online questionnaire", full: "2 calls + in-depth analysis with your team" },
        { label: "Duration", free: "Instant", full: "2 weeks" },
        { label: "Scope", free: "High-level general diagnostic", full: "Detailed mapping of your real processes" },
        { label: "Opportunities", free: "The main ones, orientative", full: "3–5 prioritized, with impact and effort" },
        { label: "Deliverable", free: "This report (preview)", full: "10–12 page report + actionable plan" },
        { label: "Implementation plan", free: "—", full: "Clear route of what to automate first and how" },
        { label: "Cost", free: "Free", full: "from $8,000 MXN · limited-time offer" },
      ]
    : [
        { label: "Formato", free: "Cuestionario online automático", full: "2 llamadas + análisis a profundidad con tu equipo" },
        { label: "Duración", free: "Inmediato", full: "2 semanas" },
        { label: "Alcance", free: "Diagnóstico general a alto nivel", full: "Mapeo detallado de tus procesos reales" },
        { label: "Oportunidades", free: "Las principales, orientativas", full: "3–5 priorizadas, con impacto y esfuerzo" },
        { label: "Entregable", free: "Este reporte (adelanto)", full: "Reporte de 10–12 páginas + plan accionable" },
        { label: "Plan de implementación", free: "—", full: "Ruta clara de qué automatizar primero y cómo" },
        { label: "Costo", free: "Gratis", full: "desde $8,000 MXN · oferta por tiempo limitado" },
      ];
  const why: { t: string; b: string }[] = en
    ? [
        { t: "Clarity to decide: ", b: "you stop guessing what to automate first and have a plan with priorities." },
        { t: "No endless-project risk: ", b: "it's 2 weeks, not 6 months. If you decide not to continue, the diagnostic is yours." },
        { t: "Fast return: ", b: "the first automations usually pay for themselves in recovered team hours." },
      ]
    : [
        { t: "Claridad para decidir: ", b: "dejas de adivinar qué automatizar primero y tienes un plan con prioridades." },
        { t: "Sin riesgo de un proyecto eterno: ", b: "son 2 semanas, no 6 meses. Si al final decides no seguir, te quedas con el diagnóstico." },
        { t: "Retorno rápido: ", b: "las primeras automatizaciones suelen pagarse solas en horas recuperadas del equipo." },
      ];
  const whyTitle = en ? "Why take the step?" : "¿Por qué dar el paso?";

  const intro = content.exec_intro.slice(0, 2);
  const findings = content.findings.slice(0, 3);
  const opportunities = content.opportunities.slice(0, 3);
  const quickWins = content.quick_wins.slice(0, 3);
  const strategic = content.strategic_projects.slice(0, 3);

  return (
    <Document title={`AI Free Assessment — ${meta.company}`} author="Itzam.AI">
      {/* ── Page 1 · Cover ── */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Logo />
          <View style={{ marginTop: 90 }}>
            <Text style={s.eyebrow}>AI FREE ASSESSMENT</Text>
            <Text style={s.coverTitle}>{T.coverTitle}</Text>
            <Text style={s.coverSub}>{content.subtitle || T.subtitleFallback}</Text>
          </View>
          <View style={s.coverDivider} />
          <MetaRow label={T.preparedFor} value={`${meta.fullName} — ${meta.role}`} />
          <MetaRow label={T.company} value={`${meta.company}${meta.industry ? ` (${meta.industry})` : ""}`} />
          <MetaRow label={T.date} value={meta.dateStr} />
          <MetaRow label={T.preparedBy} value="Itzam.AI · itzam.ai · contact@itzam.ai" />
          <Text style={s.coverFoot}>{T.disclaimer}</Text>
        </View>
      </Page>

      {/* ── Page 2 · Executive summary ── */}
      <Page size="A4" style={s.page}>
        <Band company={meta.company} />
        <View style={s.content}>
          <Text style={s.h1}>{T.execSummary}</Text>
          <View style={s.rule} />
          {intro.map((para, i) => (
            <Text key={i} style={s.p}>{para}</Text>
          ))}

          <View style={s.scoreCard} wrap={false}>
            <View>
              <Text style={s.scoreNum}>
                {score.score}
                <Text style={s.scoreSlash}>/100</Text>
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.scoreLabelSm}>{T.scoreLabel}</Text>
              <Text style={s.scoreBand}>{T.nivel}: {bandLabel}</Text>
              <Text style={s.scoreBlurb}>{content.score_blurb}</Text>
            </View>
          </View>

          <View style={s.callout} wrap={false}>
            <Text style={{ color: INK }}>
              <Text style={s.bold}>{T.costLead}</Text>
              {content.cost_callout}
            </Text>
          </View>

          <Text style={[s.bold, { fontSize: 13, marginTop: 4, marginBottom: 6 }]}>{T.findingsTitle}</Text>
          {findings.map((f, i) => (
            <View key={i} style={s.findingRow} wrap={false}>
              <Text style={s.bullet}>•</Text>
              <Text style={{ flex: 1, color: BODY }}>
                <Text style={s.bold}>{f.title} </Text>
                {f.body}
              </Text>
            </View>
          ))}
        </View>
        <Footer />
      </Page>

      {/* ── Page 3 · Diagnosis by area ── */}
      <Page size="A4" style={s.page}>
        <Band company={meta.company} />
        <View style={s.content}>
          <Text style={s.h1}>{T.byArea}</Text>
          <View style={s.rule} />
          <Text style={[s.p, { marginBottom: 16 }]}>{T.byAreaIntro}</Text>
          {CANONICAL.map((key) => {
            const value = valueByKey.get(key) ?? 0;
            const note = content.dimensions[key];
            const color = dimensionColor(value);
            return (
              <View key={key} style={s.dimBlock}>
                <View style={s.dimHead}>
                  <Text style={s.dimName}>{DIM_LABELS[key][locale]}</Text>
                  <Text style={[s.dimStatus, { color }]}>{value} / 100 · {note.status}</Text>
                </View>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${Math.max(3, value)}%`, backgroundColor: color }]} />
                </View>
                <Text style={{ color: BODY, fontSize: 10 }}>
                  {note.observation}{" "}
                  <Text style={s.bold}>{T.costInline}</Text>
                  {note.cost}
                </Text>
              </View>
            );
          })}
        </View>
        <Footer />
      </Page>

      {/* ── Page 4 · Opportunities ── */}
      <Page size="A4" style={s.page}>
        <Band company={meta.company} />
        <View style={s.content}>
          <Text style={s.h1}>{T.oppTitle}</Text>
          <View style={s.rule} />
          <Text style={[s.p, { marginBottom: 14 }]}>{T.oppIntro}</Text>
          {opportunities.map((o, i) => (
            <View key={i} style={s.oppBlock}>
              <Text style={s.oppTitle}>{o.title}</Text>
              <Text style={[s.p, { marginBottom: 5 }]}>
                <Text style={s.bold}>{T.problem}</Text>{o.problem}
              </Text>
              <Text style={[s.p, { marginBottom: 5 }]}>
                <Text style={s.bold}>{T.aiCan}</Text>{o.ai_can_do}
              </Text>
              <Text style={[s.p, { marginBottom: 5 }]}>
                <Text style={s.bold}>{T.impact}</Text>{o.impact}
              </Text>
              <Text style={s.pill}>{T.solution}{o.solution}</Text>
            </View>
          ))}
        </View>
        <Footer />
      </Page>

      {/* ── Page 5 · Free vs Full (static) ── */}
      <Page size="A4" style={s.page}>
        <Band company={meta.company} />
        <View style={s.content}>
          <Text style={s.h1}>{T.firstStep}</Text>
          <View style={s.rule} />
          <Text style={[s.p, { marginBottom: 14 }]}>{T.firstStepIntro}</Text>

          <View style={s.table}>
            <View style={s.trHead}>
              <Text style={s.thLabel}> </Text>
              <Text style={s.th}>AI Free Assessment</Text>
              <Text style={s.thGold}>AI Opportunity Assessment</Text>
            </View>
            {cmp.map((r, i) => (
              <View key={i} style={s.tr}>
                <Text style={s.tdLabel}>{r.label}</Text>
                <Text style={s.td}>{r.free}</Text>
                <Text style={s.tdGold}>{r.full}</Text>
              </View>
            ))}
          </View>

          <Text style={[s.bold, { fontSize: 13, marginBottom: 8 }]}>{whyTitle}</Text>
          {why.map((w, i) => (
            <View key={i} style={s.findingRow}>
              <Text style={s.bullet}>•</Text>
              <Text style={{ flex: 1, color: BODY }}>
                <Text style={s.bold}>{w.t}</Text>{w.b}
              </Text>
            </View>
          ))}
        </View>
        <Footer />
      </Page>

      {/* ── Page 6 · Starting plan + CTA ── */}
      <Page size="A4" style={s.page}>
        <Band company={meta.company} />
        <View style={s.content}>
          <Text style={s.h1}>{T.planTitle}</Text>
          <View style={s.rule} />
          <View style={s.planCols}>
            <View style={s.planCard}>
              <Text style={s.planHeadGreen}>{T.quickWins}</Text>
              {quickWins.map((q, i) => (
                <View key={i} style={s.findingRow}>
                  <Text style={{ color: "#3F9E63" }}>•</Text>
                  <Text style={{ flex: 1, color: BODY, fontSize: 10 }}>{q}</Text>
                </View>
              ))}
            </View>
            <View style={s.planCard}>
              <Text style={s.planHeadBlue}>{T.deepProjects}</Text>
              {strategic.map((q, i) => (
                <View key={i} style={s.findingRow}>
                  <Text style={{ color: BLUE }}>•</Text>
                  <Text style={{ flex: 1, color: BODY, fontSize: 10 }}>{q}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.ctaBox}>
            <Text style={s.ctaTitle}>{T.nextStep}</Text>
            <Text style={s.ctaBody}>{T.nextStepBody}</Text>
            <Text style={s.ctaPrice}>
              {T.price}
              <Text style={{ color: GOLD, fontSize: 10 }}>{T.priceNote}</Text>
            </Text>
            <Text style={{ color: "#8FA0B0", fontSize: 9, marginTop: 6 }}>{T.payNote}</Text>
            <Link src={`https://itzam.ai/${locale}/contact`} style={s.ctaBtn}>{T.ctaBtn}</Link>
          </View>

          <Text style={{ color: MUTED, fontSize: 9.5, marginTop: 16 }}>{T.contactLine}</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

export async function renderReportPdf(data: ReportPdfData): Promise<Buffer> {
  return renderToBuffer(<ReportDoc {...data} />);
}

/** Minimal 1-page PDF for the dev-only Drive connectivity check. */
export async function renderTestPdf(): Promise<Buffer> {
  const doc = (
    <Document title="Drive connectivity test" author="Itzam.AI">
      <Page size="A4" style={s.page}>
        <View style={{ padding: 54 }}>
          <Logo />
          <Text style={[s.h1, { marginTop: 40 }]}>Drive connectivity test</Text>
          <View style={s.rule} />
          <Text style={s.p}>
            If you can see this file in the &quot;Itzam — AI Free Assessment&quot; Drive folder,
            the Apps Script save_report action and Drive authorization are working.
          </Text>
          <Text style={{ color: MUTED, fontSize: 9, marginTop: 8 }}>
            Generated {new Date().toISOString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}

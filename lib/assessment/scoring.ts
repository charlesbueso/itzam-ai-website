import type { SelfAnswers } from "./questions";

/**
 * Deterministic AI Sales Readiness score. Computed in CODE, never by the model,
 * so identical answers always yield an identical score.
 *
 * The composite is a weighted average of 5 dimensions, each scored 0–100 from a
 * fixed point table (see the q-review spec §2). Weights live ONLY here.
 *
 *   response_speed      25%   <- q13_response_speed
 *   ai_maturity         20%   <- q15_ai_tried
 *   data_crm            20%   <- q6_crm_tools + q7_crm_usage
 *   documented_process  20%   <- q11_process_doc
 *   proposals           15%   <- q12_proposals
 */

export type Band = "manual" | "in_motion" | "building" | "ai_ready";

export type DimensionKey =
  | "response_speed"
  | "ai_maturity"
  | "data_crm"
  | "documented_process"
  | "proposals";

export type ScoreResult = {
  score: number;
  band: Band;
  /** 0–100 per dimension, weakest first. */
  dimensions: { key: DimensionKey; value: number }[];
};

const RESPONSE_SPEED: Record<string, number> = { days_week: 10, hours_nextday: 45, under_1h: 75, immediate: 95 };
const AI_MATURITY: Record<string, number> = { never: 15, chatgpt_informal: 35, structured_project: 65, running: 85 };
const DOCUMENTED_PROCESS: Record<string, number> = { in_heads: 15, partial: 50, documented: 85 };
const PROPOSALS: Record<string, number> = { manual: 25, templates: 55, semi_auto: 80 };
const CRM_USAGE_BASE: Record<string, number> = { barely: 20, messy: 40, underused: 65, well: 85 };

const REAL_CRMS = new Set(["hubspot", "salesforce", "zoho", "pipedrive", "bitrix24", "sugar"]);
const LIGHT_TOOLS = new Set(["excel_sheets", "whatsapp"]);

const WEIGHTS: Record<DimensionKey, number> = {
  response_speed: 0.25,
  ai_maturity: 0.2,
  data_crm: 0.2,
  documented_process: 0.2,
  proposals: 0.15,
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function dataCrmScore(answers: SelfAnswers): number {
  let dc = CRM_USAGE_BASE[String(answers.q7_crm_usage)] ?? 0;
  const tools = Array.isArray(answers.q6_crm_tools) ? answers.q6_crm_tools : [];
  const hasReal = tools.some((t) => REAL_CRMS.has(t));
  const hasNone = tools.includes("none");
  const onlyLight = !hasReal && tools.some((t) => LIGHT_TOOLS.has(t));

  if (hasReal) dc += 10;
  else if (onlyLight) dc -= 10;
  if (hasNone) dc = Math.min(dc, 25);

  return clamp(dc, 5, 100);
}

export function computeScore(answers: SelfAnswers): ScoreResult {
  const dims: Record<DimensionKey, number> = {
    response_speed: RESPONSE_SPEED[String(answers.q13_response_speed)] ?? 0,
    ai_maturity: AI_MATURITY[String(answers.q15_ai_tried)] ?? 0,
    data_crm: dataCrmScore(answers),
    documented_process: DOCUMENTED_PROCESS[String(answers.q11_process_doc)] ?? 0,
    proposals: PROPOSALS[String(answers.q12_proposals)] ?? 0,
  };

  const composite =
    dims.response_speed * WEIGHTS.response_speed +
    dims.ai_maturity * WEIGHTS.ai_maturity +
    dims.data_crm * WEIGHTS.data_crm +
    dims.documented_process * WEIGHTS.documented_process +
    dims.proposals * WEIGHTS.proposals;

  const score = Math.round(composite);
  const band: Band = score <= 30 ? "manual" : score <= 50 ? "in_motion" : score <= 70 ? "building" : "ai_ready";

  const dimensions = (Object.keys(dims) as DimensionKey[]).map((key) => ({ key, value: dims[key] }));
  dimensions.sort((a, b) => a.value - b.value);

  return { score, band, dimensions };
}

// ─────────────────────── Value at stake (MXN / month) ───────────────────────

const LEADS_MID: Record<string, number> = { lt10: 6, r10_30: 20, r30_100: 60, gt100: 120 };
const TICKET_MID: Record<string, number> = { lt20k: 12000, r20_80k: 45000, r80_300k: 170000, gt300k: 400000 };
const SPEED_PENALTY: Record<string, number> = { days_week: 0.25, hours_nextday: 0.12, under_1h: 0.04, immediate: 0.01 };

export type ValueAtStake = {
  /** Monthly pipeline (MXN) exposed to slow first response, or null if unknown. */
  mxnPerMonth: number | null;
  /** Midpoint leads/month used, for the narrative ("~60 leads/month"). */
  leadsMid: number | null;
};

/**
 * Directional estimate of monthly pipeline (MXN) exposed to slow response time.
 * Only computed when leads/month is answered AND a ticket range is given.
 * NOT a promise of lost revenue — the report always phrases it conditionally.
 */
export function computeValueAtStake(answers: SelfAnswers): ValueAtStake {
  const leadsMid = LEADS_MID[String(answers.q4_leads_month)] ?? null;
  const ticketMid = TICKET_MID[String(answers.q5_avg_ticket)] ?? null; // undefined/"na" -> null
  const penalty = SPEED_PENALTY[String(answers.q13_response_speed)] ?? null;

  if (leadsMid == null || ticketMid == null || penalty == null) {
    return { mxnPerMonth: null, leadsMid };
  }
  return { mxnPerMonth: Math.round(leadsMid * ticketMid * penalty), leadsMid };
}

import type { SelfAnswers } from "./questions";

/**
 * Deterministic AI Sales Readiness score. Computed server-side on submit so
 * the score screen renders instantly — the LLM only writes prose, never math.
 *
 * Weights mirror the original prototype: CRM usage 24, playbook 20,
 * response speed 18, AI experience 30, proposals 14, tool stack 14 → /120,
 * normalized to 0–100 with a floor of 8.
 */

export type Band = "explorer" | "in_progress" | "advanced";

export type DimensionKey =
  | "data_crm"
  | "playbook"
  | "proposals"
  | "response_speed"
  | "ai_maturity";

export type ScoreResult = {
  score: number;
  band: Band;
  /** 0–100 per dimension, weakest first. */
  dimensions: { key: DimensionKey; value: number }[];
};

const CRM_USAGE_PTS: Record<string, number> = { none: 4, low: 9, mid: 17, high: 24 };
const PLAYBOOK_PTS: Record<string, number> = { no: 2, partial: 11, yes: 20 };
const RESPONSE_PTS: Record<string, number> = { week: 1, slow: 5, mid: 12, fast: 18 };
const AI_PTS: Record<string, number> = { never: 6, informal: 14, structured: 24, working: 30 };
const PROPOSAL_PTS: Record<string, number> = { manual: 2, template: 8, auto: 14 };

const REAL_CRMS = new Set(["hubspot", "salesforce", "zoho_monday"]);

function toolPoints(tools: string[]): number {
  if (tools.includes("none")) return 0;
  return tools.some((t) => REAL_CRMS.has(t)) ? 14 : 6;
}

export function computeScore(answers: SelfAnswers): ScoreResult {
  const crm = CRM_USAGE_PTS[String(answers.crm_usage)] ?? 0;
  const playbook = PLAYBOOK_PTS[String(answers.playbook)] ?? 0;
  const response = RESPONSE_PTS[String(answers.response_time)] ?? 0;
  const ai = AI_PTS[String(answers.ai_experience)] ?? 0;
  const proposals = PROPOSAL_PTS[String(answers.proposals)] ?? 0;
  const tools = toolPoints(Array.isArray(answers.crm_tools) ? answers.crm_tools : []);

  const raw = crm + playbook + response + ai + proposals + tools;
  const max = 24 + 20 + 18 + 30 + 14 + 14; // 120
  const score = Math.max(8, Math.round((raw / max) * 100));

  const band: Band = score < 35 ? "explorer" : score < 65 ? "in_progress" : "advanced";

  const dimensions: { key: DimensionKey; value: number }[] = [
    { key: "data_crm", value: Math.round(((crm + tools) / 38) * 100) },
    { key: "playbook", value: Math.round((playbook / 20) * 100) },
    { key: "proposals", value: Math.round((proposals / 14) * 100) },
    { key: "response_speed", value: Math.round((response / 18) * 100) },
    { key: "ai_maturity", value: Math.round((ai / 30) * 100) },
  ];
  dimensions.sort((a, b) => a.value - b.value);

  return { score, band, dimensions };
}

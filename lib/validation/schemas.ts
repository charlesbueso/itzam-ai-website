import "server-only";

import { z } from "zod";

const UUID = z.string().uuid();

const ANSWER_VALUE = z.union([
  z.string().max(5000),
  z.array(z.string().max(200)).max(50),
  z.null(),
]);

export const AnswerItem = z.object({
  question_id: UUID,
  value: ANSWER_VALUE,
});

export const AnswersBatch = z.object({
  questionnaire_id: UUID,
  items: z.array(AnswerItem).min(1).max(50),
});

export const CreateQuestionnaire = z.object({
  client_name: z.string().trim().min(1).max(200),
  client_company: z.string().trim().min(1).max(200),
  client_email: z.string().trim().toLowerCase().email().max(320),
  preferred_locale: z.enum(["es", "en"]).default("es"),
}).strict();

export const UpdateQuestionnaire = z.object({
  client_name: z.string().trim().min(1).max(200).optional(),
  client_company: z.string().trim().min(1).max(200).optional(),
  client_email: z.string().trim().toLowerCase().email().max(320).optional(),
  preferred_locale: z.enum(["es", "en"]).optional(),
}).strict();

export const IssueLinkBody = z.object({
  force: z.boolean().optional(),
}).strict();

export const CancelBody = z.object({}).strict();

export const SubmitBody = z.object({}).strict();

const QuestionOption = z.object({
  value: z.string().trim().min(1).max(80),
  label_es: z.string().trim().min(1).max(200),
  label_en: z.string().trim().min(1).max(200),
}).strict();

export const QuestionPatch = z.object({
  id: UUID,
  label_es: z.string().trim().min(1).max(500).optional(),
  label_en: z.string().trim().min(1).max(500).optional(),
  options: z.array(QuestionOption).max(20).optional(),
}).strict();

export const QuestionsBatchPatch = z.object({
  items: z.array(QuestionPatch).min(1).max(20),
}).strict();

export const CustomQuestionCreate = z.object({
  type: z.enum(["text", "single", "multi"]),
  label_es: z.string().trim().min(1).max(500),
  label_en: z.string().trim().min(1).max(500),
  required: z.boolean().optional().default(true),
  multiline: z.boolean().optional().default(false),
  options: z.array(QuestionOption).max(20).optional().default([]),
}).strict().superRefine((val, ctx) => {
  if (val.type === "text") {
    if (val.options && val.options.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "text questions cannot have options", path: ["options"] });
    }
  } else {
    if (!val.options || val.options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "choice questions need at least 2 options", path: ["options"] });
    }
    if (val.options) {
      const seen = new Set<string>();
      for (const o of val.options) {
        if (seen.has(o.value)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "duplicate option value", path: ["options"] });
          break;
        }
        seen.add(o.value);
      }
    }
  }
});

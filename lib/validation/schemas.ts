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
  client_email: z.string().trim().toLowerCase().email().max(320),
  preferred_locale: z.enum(["es", "en"]).default("es"),
}).strict();

export const UpdateQuestionnaire = z.object({
  client_name: z.string().trim().min(1).max(200).optional(),
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

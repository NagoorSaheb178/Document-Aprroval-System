import { z } from "zod";

export const CreateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export const EditDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  body: z.string().min(1, "Body is required").optional(),
  expectedVersion: z.number().int().positive("Expected version is required for optimistic concurrency"),
});

export const ActionWithVersionSchema = z.object({
  expectedVersion: z.number().int().positive("Expected version is required"),
});

export const RejectSchema = z.object({
  expectedVersion: z.number().int().positive("Expected version is required"),
  comment: z.string().min(1, "Rejection reason is required"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

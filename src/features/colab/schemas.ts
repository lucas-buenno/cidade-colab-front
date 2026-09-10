import { z } from "zod";
import { messages } from "@/shared/i18n/pt-BR";

export const createColabSchema = z.object({
  title: z.string().trim().min(1, messages.validation.required),
  description: z.string().trim().min(1, messages.create.descriptionRequired),
  categoriesSlugs: z
    .array(z.string())
    .min(1, messages.create.categoryRequired),
  location: z.object({
    name: z.string(),
    reference: z.string(),
    street: z.string().trim().min(1, messages.create.streetRequired),
    number: z.string(),
    neighborhood: z
      .string()
      .trim()
      .min(1, messages.create.neighborhoodRequired),
    postalCode: z.string(),
    coordinates: z
      .tuple([z.number(), z.number()])
      .nullable()
      .refine((value): value is [number, number] => value !== null, {
        message: messages.create.coordinatesRequired,
      }),
  }),
});

export type CreateColabFormValues = {
  title: string;
  description: string;
  categoriesSlugs: string[];
  location: {
    name: string;
    reference: string;
    street: string;
    number: string;
    neighborhood: string;
    postalCode: string;
    coordinates: [number, number] | null;
  };
};

import z from "zod";

// Define the schema for the form using Zod
export const tokenFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Token Name is required" })
    .max(50)
    .refine((value) => value.trim().length > 0, {
      message: "Token Name is required",
    }),
  decimals: z
    .number({
      required_error: "Decimals is required", // Error if not provided
      invalid_type_error: "Decimals must be a number",
    })
    .min(0, { message: "Decimals must be 0 or greater" })
    .max(9, { message: "Decimals cannot be greater than 9" }),

  initialSupply: z.coerce
    .number()
    .min(1, { message: "Initial supply must be 1 or greater" }),
  image: z
    .instanceof(File, { message: "Please upload an image" })

    .refine((file) => allowedImages.includes(file.type), {
      message: "Image must be in JPEG/PNG",
    })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "File size must be less than 2MB.",
    }),
  description: z
    .string()
    .min(1, { message: "Token Description is required" })
    .max(200)
    .refine((value) => value.trim().length > 0, {
      message: "Token Description is required",
    }),
});

const allowedImages = ["image/jpeg", "image/png"];

export type TokenFormValues = z.infer<typeof tokenFormSchema>;

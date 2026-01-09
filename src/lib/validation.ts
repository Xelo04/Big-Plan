import z from "zod";

export const passwordSchema = z
  .string()
  .min(8, { message: "Hasło musi mieć co najmniej 8 znaków" })
  .max(20, { message: "Hasło nie może przekraczać 20 znaków" })
  .regex(/[A-Z]/, {
    message: "Hasło musi zawierać co najmniej 1 wielką literę",
  })
  .regex(/[^A-Za-z0-9]/, {
    message: "Hasło musi zawierać co najmniej 1 znak specjalny",
  });

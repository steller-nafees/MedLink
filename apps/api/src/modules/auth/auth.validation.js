const { z } = require("zod");

const signupSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase(),

  phone: z
    .string()
    .regex(
      /^\+8801[3-9]\d{8}$/,
      "Phone number must be in the format +8801XXXXXXXXX"
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*]/,
      "Password must contain at least one special character"
    ),

  userType: z.enum([
    "CUSTOMER",
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "AMBULANCE_ADMIN",
  ]),

  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().trim().optional(),
  nationalId: z.string().trim().optional(),
  address: z.string().trim().optional(),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactPhone: z
    .string()
    .regex(
      /^\+8801[3-9]\d{8}$/,
      "Emergency contact phone number must be in the format +8801XXXXXXXXX"
    )
    .optional(),
  bloodGroup: z.string().trim().optional(),
}).strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .email("Please provide a valid email address")
      .trim()
      .optional(),

    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .optional(),

    password: z
      .string()
      .min(1, "Password is required"),

    rememberMe: z
      .boolean()
      .optional()
      .default(false),
  })
  .refine(
    (data) => data.email || data.phone,
    {
      message: "Email or phone number is required",
      path: ["email"],
    }
  );

const emergencyLoginSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    phone: z
        .string()
        .regex(
            /^\+8801[3-9]\d{8}$/,
            "Phone number must be in the format +8801XXXXXXXXX"
        ),

    latitude: z
        .number()
        .min(-90)
        .max(90),

    longitude: z
        .number()
        .min(-180)
        .max(180),
});

module.exports = {
  signupSchema,
  loginSchema,
  emergencyLoginSchema,
};

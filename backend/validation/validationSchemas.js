import Joi from "joi";

const currentYear = new Date().getFullYear();
const minYear = currentYear - 1;
const maxYear = currentYear + 1;
const today = new Date();
today.setHours(0, 0, 0, 0);

const id = Joi.number().integer().positive().required().messages({
  "number.base": "ID must be a number",
  "number.integer": "ID must be an integer",
  "number.positive": "ID must be positive",
});

const email = Joi.string().email().required().messages({
  "string.email": "Please enter a valid email address",
  "string.empty": "Email is required",
});

const password = Joi.string()
  .min(6)
  .max(30)
  .required()
  .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
  .messages({
    "string.pattern.base":
      "Password must contain at least 1 uppercase, 1 lowercase and 1 number",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password cannot exceed 30 characters",
  });

const name = Joi.string()
  .min(2)
  .max(50)
  .required()
  .regex(/^[a-zA-Z ]+$/)
  .messages({
    "string.pattern.base": "Name can only contain letters and spaces",
  });

const date = Joi.date()
  .iso()
  .required()
  .messages({
    "date.base": "Invalid date format (YYYY-MM-DD required)",
    "date.min": `Date cannot be before ${minYear}-01-01`,
    "date.max": `Date cannot be after ${maxYear}-12-31`,
  });

const futureDate = Joi.date()
  .iso()
  .required()
  .min(today.toISOString().split("T")[0])
  .messages({
    "date.base": "Invalid date format (YYYY-MM-DD required)",
    "date.min":
      "Cannot apply for leaves before today. Contact admin for backdated leaves.",
  });

const text = Joi.string().min(3).max(500).required().messages({
  "string.empty": "This field cannot be empty",
});

export const authSchemas = {
  register: Joi.object({
    name: name,
    email: email,
    password: password,
    role: Joi.string()
      .valid("employee", "manager", "admin")
      .required()
      .messages({
        "any.only": "Role must be one of employee, manager, or admin",
      }),
    managerId: Joi.number().integer().positive().optional().messages({
      "number.base": "Manager ID must be a number",
    }),
  }).options({ abortEarly: false }),

  login: Joi.object({
    email: email,
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }).options({ abortEarly: false }),
};

export const leaveSchemas = {
  applyLeave: Joi.object({
    fromDate: date,
    toDate: Joi.date().iso().min(Joi.ref("fromDate")).required().messages({
      "date.min": "End date must be after start date",
    }),
    type: Joi.string().valid("casual", "sick", "annual").required().messages({
      "any.only": "Leave type must be casual, sick, or annual",
    }),
    reason: text,
  }).options({ abortEarly: false }),

  teamLeaveQuery: Joi.object({
    status: Joi.string()
      .valid("pending", "approved", "rejected", "all")
      .optional()
      .messages({
        "any.only": "Status must be pending, approved, rejected, or all",
      }),
    month: Joi.number().integer().min(1).max(12).optional().messages({
      "number.base": "Month must be a number between 1-12",
      "number.min": "Month must be between 1-12",
      "number.max": "Month must be between 1-12",
    }),
    year: Joi.number()
      .integer()
      .min(minYear)
      .max(maxYear)
      .optional()
      .messages({
        "number.base": "Year must be a valid year",
        "number.min": `Year must be at least ${minYear}`,
        "number.max": `Year cannot be after ${maxYear}`,
      }),
    page: Joi.number().integer().min(1).default(1).optional().messages({
      "number.base": "Page must be a positive integer",
    }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .optional()
      .messages({
        "number.base": "Limit must be a positive integer",
        "number.max": "Limit cannot exceed 100",
      }),
  })
    .with("month", "year")
    .options({ abortEarly: false }),
  processLeave: Joi.object({
    status: Joi.string().valid("approved", "rejected").required().messages({
      "any.only": "Status must be 'approved' or 'rejected'",
    }),
    comment: Joi.string().optional().allow("").messages({
      "string.base": "Comment must be a string",
    }),
  }).options({ abortEarly: false }),
};

export const userSchemas = {
  createUser: Joi.object({
    name: name,
    email: email,
    password: password,
    role: Joi.string().valid("employee", "manager", "admin").required(),
    managerId: Joi.when("role", {
      is: "employee",
      then: Joi.number().integer().positive().required().messages({
        "any.required": "Employees must have a manager assigned",
      }),
      otherwise: Joi.number().integer().positive().optional(),
    }),
  }).options({ abortEarly: false }),

  updateUser: Joi.object({
    name: name.optional(),
    email: email.optional(),
    password: password.optional(),
    role: Joi.string().valid("employee", "manager", "admin").optional(),
    managerId: Joi.number().integer().positive().optional(),
  }).options({ abortEarly: false }),
};

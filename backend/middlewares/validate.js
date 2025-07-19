import {
  authSchemas,
  leaveSchemas,
  userSchemas,
} from "../validation/validationSchemas.js";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      context: { user: req.user },
    };

    const { error } = schema.validate(req[property], validationOptions);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));

      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

export const validateRegister = validate(authSchemas.register);
export const validateLogin = validate(authSchemas.login);
export const validateApplyLeave = validate(leaveSchemas.applyLeave);
export const validateProcessLeave = validate(leaveSchemas.processLeave);
export const validateTeamLeaveQuery = validate(
  leaveSchemas.teamLeaveQuery,
  "query"
);
export const validateCreateUser = validate(userSchemas.createUser);
export const validateUpdateUser = validate(userSchemas.updateUser);

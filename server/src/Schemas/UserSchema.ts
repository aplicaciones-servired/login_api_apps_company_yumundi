import z from 'zod';

const User = z.object({
  names: z.string({
    invalid_type_error: 'El nombre debe ser una cadena de texto',
    required_error: 'El nombre es requerido',
  }).min(4, { message: 'Los nombres son requeridos' }),
  lastNames: z.string({
    invalid_type_error: 'El apellido debe ser una cadena de texto',
    required_error: 'El apellido es requerido',
  }).min(4, { message: 'Los apellidos son requeridos' }),
  document: z.string({
    invalid_type_error: 'El documento es requerido',
    required_error: 'El documento es requerido',
  }).transform((val) => parseInt(val, 10)).refine((value) => !isNaN(value)),
  phone: z.string({
    invalid_type_error: 'El teléfono es requerido',
    required_error: 'El teléfono es requerido',
  }).transform((val) => parseInt(val, 10)).refine((value) => !isNaN(value)),
  email: z.string({
    invalid_type_error: 'El correo debe ser una cadena de texto',
    required_error: 'El correo es requerido',
  }).refine((value) => value.includes('@'), {
    message: 'El correo debe contener un @',
  }),
  company: z.string({
    invalid_type_error: 'La compañía es requerida',
    required_error: 'La compañía es requerida',
  }).transform((val) => parseInt(val, 10)).refine((value) => !isNaN(value)),
  process: z.string({
    invalid_type_error: 'El proceso es requerido',
    required_error: 'El proceso es requerido',
  }).transform((val) => parseInt(val, 10)).refine((value) => !isNaN(value)),
  sub_process: z.string({
    invalid_type_error: 'El sub-proceso es requerido',
    required_error: 'El sub proceso es requerido',
  }).transform((val) => parseInt(val, 10)).refine((value) => !isNaN(value))
});

const UserLogin = z.object({
  username: z.string({
    invalid_type_error: 'El nombre de usuario debe ser una cadena de texto',
    required_error: 'El nombre de usuario es requerido',
  }),
  password: z.string({
    invalid_type_error: 'La contraseña debe ser una cadena de texto',
    required_error: 'La contraseña es requerida',
  })
})

const numericField = (requiredMessage: string) =>
  z
    .union([
      z.string({ required_error: requiredMessage }),
      z.number({ required_error: requiredMessage }),
    ])
    .transform((val) => (typeof val === 'number' ? val : parseInt(val.trim(), 10)))
    .refine((value) => !isNaN(value), { message: requiredMessage });

const UserUpdate = z.object({
  names: z
    .string({
      invalid_type_error: 'El nombre debe ser una cadena de texto',
      required_error: 'El nombre es requerido',
    })
    .trim()
    .min(2, { message: 'Los nombres son requeridos' })
    .max(40, { message: 'Los nombres no pueden superar 40 caracteres' }),
  lastNames: z
    .string({
      invalid_type_error: 'El apellido debe ser una cadena de texto',
      required_error: 'El apellido es requerido',
    })
    .trim()
    .min(2, { message: 'Los apellidos son requeridos' })
    .max(40, { message: 'Los apellidos no pueden superar 40 caracteres' }),
  document: numericField('El documento es requerido'),
  phone: numericField('El teléfono es requerido'),
  email: z
    .string({
      invalid_type_error: 'El correo debe ser una cadena de texto',
      required_error: 'El correo es requerido',
    })
    .trim()
    .refine((value) => value.includes('@'), {
      message: 'El correo debe contener un @',
    }),
  company: numericField('La compañía es requerida'),
  process: numericField('El proceso es requerido'),
  sub_process: numericField('El sub proceso es requerido'),
});

export type UserType = z.infer<typeof User>;
export type UserLoginType = z.infer<typeof UserLogin>;
export type UserUpdateType = z.infer<typeof UserUpdate>;

export function validateUser(data: unknown) {
  return User.safeParseAsync(data);
}

export function validateUserLogin(data: unknown) {
  return UserLogin.safeParseAsync(data);
}

export function validateUserUpdate(data: unknown) {
  return UserUpdate.safeParseAsync(data);
}
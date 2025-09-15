import { z } from 'zod';

const baseRegisterSchema = z.object({
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  firstName: z.string(),
  lastName: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '',
  path: ['confirmPassword'],
});

export type RegisterSchema = z.infer<typeof baseRegisterSchema>;

export const registerSchema = (t: (key: string) => string) => {
  return baseRegisterSchema
    .extend({
      email: z.string().email({ message: t('validation.invalidEmail') }),
      password: z
        .string()
        .min(6, { message: t('validation.minPassword') })
        .regex(/[A-Z]/, { message: t('validation.uppercase') })
        .regex(/[0-9]/, { message: t('validation.number') }),
      firstName: z.string().min(1, { message: t('validation.requiredFirstName') }),
      lastName: z.string().min(1, { message: t('validation.requiredLastName') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });
};

const baseLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type LoginSchema = z.infer<typeof baseLoginSchema>;

export const loginSchema = (t: (key: string) => string) => {
  return baseLoginSchema
    .extend({
      email: z.string().email({ message: t('validation.invalidEmail') }),
      password: z
        .string()
        .min(6, { message: t('validation.minPassword') })
        .regex(/[A-Z]/, { message: t('validation.uppercase') })
        .regex(/[0-9]/, { message: t('validation.number') }),
    });
};


const baseProfileSchema = z.object({
  email: z.string(),
  avatar: z.string(),
  familyName: z.string(),
  givenName: z.string(),
  role: z.string(),
  salesforceAccountId: z.string()
});

export type ProfileSchema = z.infer<typeof baseProfileSchema>;

export const profileSchema = (t: (key: string) => string) => {
  return baseProfileSchema
    .extend({
      email: z.string().email({ message: t('validation.invalidEmail') }),
      givenName: z.string().min(1, { message: t('validation.requiredFirstName') }),
      familyName: z.string().min(1, { message: t('validation.requiredLastName') }),
    });
};

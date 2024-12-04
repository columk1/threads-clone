/*
 * Login
 */
// export async function login(_: unknown, formData: FormData) { // first param is prevState
//   const submission = await parseWithZod(formData, {
//     schema: loginSchema.transform(async (data, ctx) => {
//       const existingEmail = await db
//         .select()
//         .from(userTable)
//         .where(eq(userTable.email, data.email))
//         .execute()
//         .then(s => s[0])
//       if (!(existingEmail && existingEmail.id)) {
//         ctx.addIssue({
//           path: ['email'],
//           code: z.ZodIssueCode.custom,
//           message: 'Invalid email',
//         })
//         return z.NEVER
//       }

//       return { ...data, ...existingEmail }
//     }),
//     async: true,
//   })
//   logger.info(submission)

//   if (submission.status !== 'success') {
//     return submission.reply()
//   }

//   try {
//     sendEmailVerificationCode(submission.value.id, submission.value.email)
//     const cookieStore = await cookies()
//     cookieStore.set(VERIFIED_EMAIL_ALERT, 'true', {
//       maxAge: 10 * 60 * 1000, // 10 minutes
//     })
//   } catch (err) {
//     console.error(`Login error while creating Lucia session:`)
//     console.error(err)
//   }

//   return redirect('/verify-email')
// }
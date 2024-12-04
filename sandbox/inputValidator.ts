// const debouncedValidator = debounce(async (value: string) => {
//   let message = inputRef.current?.validationMessage || ''
//   if (customValidator) {
//     const { error } = await customValidator(value)
//     if (error) {
//       message = error
//       inputRef.current?.setCustomValidity(message)
//     }
//   }
//   inputRef.current?.setCustomValidity(message)
//   setValidationMessage(message)
//   setActiveError(true)
// }, 1000)

// const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   inputRef.current?.setCustomValidity('')
//   setActiveError(false)
//   debouncedValidator(e.target.value)
// }
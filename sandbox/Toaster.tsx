import type { FunctionComponent } from 'react'
import { toast } from 'sonner'

type ToasterProps = {
  message: string
}

const Toaster: FunctionComponent<ToasterProps> = ({ message }) => {
  toast(message)
  return null
}

export default Toaster

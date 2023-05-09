import '@/styles/globals.css'
import { SnackbarProvider } from 'notistack';

export default function App({ Component, pageProps }) {
  return (
    <SnackbarProvider preventDuplicate>
      <Component {...pageProps} />
    </SnackbarProvider>
  )
}

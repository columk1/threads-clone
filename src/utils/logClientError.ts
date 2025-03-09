export async function logClientError(error: Error & { digest?: string }): Promise<void> {
  try {
    await fetch('/api/log-client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error),
    })
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (_err) {}
}

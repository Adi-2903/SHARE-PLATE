export function getErrorMessage(err, fallback = 'An error occurred') {
  if (!err) return fallback;
  
  // If it's an Axios error response
  if (err.response && err.response.data) {
    const errorData = err.response.data;
    
    // Express res.json({ error: '...' })
    if (typeof errorData.error === 'string') return errorData.error;
    // Alternative Express message format
    if (typeof errorData.message === 'string') return errorData.message;
    // HTML or plain text proxy error
    if (typeof errorData === 'string') return errorData;
  }
  
  // If it's a standard JS error
  if (err instanceof Error) {
    return err.message || fallback;
  }
  
  // If err is a string directly
  if (typeof err === 'string') return err;
  
  return fallback;
}

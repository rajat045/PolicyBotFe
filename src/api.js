const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

export async function uploadFile(file, uploadedBy = 'web') {
  const form = new FormData();
  form.append('file', file);
  form.append('uploadedBy', uploadedBy);
  const res = await fetch(`${BACKEND}/api/documents/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function askQuestion(question, topK = 3) {
  const res = await fetch(`${BACKEND}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, topK }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

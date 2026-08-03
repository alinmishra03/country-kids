/* Central API configuration connecting public website (country-kids) to CMS & Backend API */

/* The single definition of where the backend lives. Both server route handlers
   import this rather than re-deriving it, so there is one place to change.

   The fallback is the deployed backend, NOT localhost. NEXT_PUBLIC_* is inlined
   at BUILD time, so a missing or misspelled Vercel env var cannot be corrected
   at runtime — it would ship a bundle pointing at localhost:3000, which on
   Vercel resolves to this site's own domain and 404s. Every caller below
   swallows failures and falls back to static content, so that breakage would be
   silent. A production default makes the missing-var case merely redundant
   instead of invisible.

   Set NEXT_PUBLIC_API_BASE_URL to override (e.g. against a local backend). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://country-kids-backend-chi.vercel.app/api/v1';

export async function fetchPublishedFaqs() {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs?status=Published`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((item: any) => ({
        q: item.question || item.q,
        a: item.answer || item.a
      }));
    }
  } catch (err) {
    console.warn('[Public API] Fallback to static FAQs due to error:', err);
  }
  return null;
}

/* NOTE: as of the backend deploy at country-kids-backend-chi, /about is not
   implemented and returns 404 — only /faqs, /enquiries and /subscribers exist.
   This therefore always returns null and /about renders its static chapters.
   That is the designed fallback, not a regression; this function starts
   returning live data the moment the endpoint ships, with no change here. */
export async function fetchPublishedAboutSections() {
  try {
    const res = await fetch(`${API_BASE_URL}/about?status=Published`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (err) {
    console.warn('[Public API] Fallback to static About chapters due to error:', err);
  }
  return null;
}

export async function submitEnquiryToBackend(payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return json.success;
  } catch (err) {
    console.warn('[Public API] Error submitting enquiry:', err);
    return false;
  }
}

export async function submitSubscriberToBackend(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json();
    return json.success;
  } catch (err) {
    console.warn('[Public API] Error submitting subscriber:', err);
    return false;
  }
}

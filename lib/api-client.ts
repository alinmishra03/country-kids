/* Central API configuration connecting public website (country-kids) to CMS & Backend API */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

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

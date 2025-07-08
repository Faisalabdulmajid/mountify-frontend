// Ambil CSRF token dari backend
export async function fetchCsrfToken(apiBaseUrl) {
  const res = await fetch(`${apiBaseUrl}/api/csrf-token`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Gagal mengambil CSRF token");
  const data = await res.json();
  return data.csrfToken || data.token || data._csrf || null;
}

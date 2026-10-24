import { baseUrl } from './constant/baseUrl';

export async function api(url, options = {}) {
  const response = await fetch(`${baseUrl}/api${url}`, {
    credentials: 'include',
    ...options
  });
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : null;
  if (!body) {
    throw new Error(`Server mengembalikan response tidak valid (${response.status}) untuk ${url}`);
  }
  if (!response.ok) throw new Error(body?.error?.message || 'Permintaan gagal');
  return body;
}

export const money = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export const assetUrl = value => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `${baseUrl}${value}`;
};

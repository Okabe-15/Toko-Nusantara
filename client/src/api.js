import { baseUrl } from './constant/baseUrl';

export async function api(url, options = {}) {
  const response = await fetch(`${baseUrl}/api${url}`, {
    credentials: 'include',
    ...options
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message || 'Permintaan gagal');
  return body;
}

export const money = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export const assetUrl = value => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `${baseUrl}${value}`;
};

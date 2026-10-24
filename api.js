const BASE_URL = 'https://dummyjson.com';

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export const getProducts = (limit, skip) =>
  request(`/products?limit=${limit}&skip=${skip}`);

export const searchProducts = (query, limit, skip) =>
  request(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`);

export const getProduct = (id) => request(`/products/${id}`);
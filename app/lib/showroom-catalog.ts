import 'server-only';
import { SHOPIFY_VARIANTS, type Tier, type Kg } from '@/app/config/shopifyProducts';
import type { ShowroomVariant } from '@/app/components/home/types';

type VariantNode = {
  id: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  product: { title: string; description: string };
};

// Use the same Storefront credentials and API version as the existing checkout.
// Only expose the configured Mystery Box variants; never expose the access token.
export async function getShowroomCatalog(): Promise<ShowroomVariant[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) throw new Error('Catalog unavailable');
  const entries = (Object.keys(SHOPIFY_VARIANTS) as Tier[]).flatMap(tier =>
    Object.entries(SHOPIFY_VARIANTS[tier]).map(([kg, id]) => ({ tier, kg: Number(kg) as Kg, id }))
  );
  const response = await fetch(`https://${domain}/api/${process.env.SHOPIFY_API_VERSION || '2024-01'}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({
      query: `query ShowroomCatalog($ids: [ID!]!) { nodes(ids: $ids) { ... on ProductVariant { id availableForSale price { amount currencyCode } product { title description } } } }`,
      variables: { ids: entries.map(({ id }) => `gid://shopify/ProductVariant/${id}`) },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Catalog unavailable');
  const data = await response.json() as { errors?: unknown[]; data?: { nodes: (VariantNode | null)[] } };
  if (data.errors?.length || !Array.isArray(data.data?.nodes)) throw new Error('Catalog unavailable');
  return entries.flatMap(entry => {
    const node = data.data!.nodes.find(node => node?.id === `gid://shopify/ProductVariant/${entry.id}`);
    const price = Number(node?.price?.amount);
    // The existing cart totals are EUR; do not silently mislabel a different currency.
    if (!node || !Number.isFinite(price) || price < 0 || node.price.currencyCode !== 'EUR') return [];
    return [{ ...entry, title: node.product.title, description: node.product.description, price, currency: 'EUR' as const, available: node.availableForSale === true }];
  });
}

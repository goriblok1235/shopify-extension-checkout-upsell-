import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

interface ProductVariant {
  merchandiseId: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  priceLabel: string;
  isInCart: boolean;
  cartLineId: string | null;
  loading: boolean;
  error: string;
}

// 1. Export the extension entry point
export default function extension() {
  render(<Extension />, document.body);
}

// 2. Preact component that renders in `purchase.checkout.block.render`
function Extension() {
  const settings = shopify.settings.value || {};
  const { query, i18n } = shopify;

  // Get the number of products to display (default to 3, max 3)
  const numberOfProducts = Math.min(
    Math.max(Number(settings.number_of_products) || 3, 1),
    3
  );

  // Get the section heading (with default from locale)
  const sectionHeading = (settings.upsell_heading as string) || i18n.translate('sectionHeading');

  // Get merchandise IDs based on the number of products setting
  const allMerchandiseIds = [
    settings.upsell_product_1,
    settings.upsell_product_2,
    settings.upsell_product_3,
  ];

  // Only take the first N products based on admin setting
  const merchandiseIds = allMerchandiseIds
    .slice(0, numberOfProducts)
    .filter(Boolean) as string[];

  console.log("Number of products to display:", numberOfProducts);
  console.log("Merchandise IDs from settings:", { merchandiseIds });

  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Can we modify the cart lines at this point in checkout?
  const canAdd = !!shopify.instructions.value?.lines?.canAddCartLine;
  const canRemove = !!shopify.instructions.value?.lines?.canRemoveCartLine;

  // Initialize products state
  useEffect(() => {
    if (merchandiseIds.length === 0) {
      setInitialLoading(false);
      return;
    }

    setProducts(
      merchandiseIds.map((id) => ({
        merchandiseId: id,
        title: '',
        imageUrl: '',
        imageAlt: '',
        priceLabel: '',
        isInCart: false,
        cartLineId: null,
        loading: true,
        error: '',
      }))
    );
  }, [merchandiseIds.join(',')]);

  // Fetch product details for all variants
  async function loadAllProducts() {
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          console.log("Querying merchandise ID:", product.merchandiseId);

          const result = await query(
            `#graphql
            query UpsellVariant($id: ID!) {
              node(id: $id) {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          `,
            { variables: { id: product.merchandiseId } }
          );

          const data = (result?.data ?? {}) as any;
          const variant = data.node;

          console.log("Result Query: ", { result });
          console.log("Data: ", { data });
          console.log('Fetched variant details', { variant });

          if (!variant) {
            return { 
              ...product, 
              loading: false, 
              error: i18n.translate('couldNotLoadProduct') 
            };
          }

          const variantTitle = variant.title as string | undefined;
          const productTitle = (variant.product && variant.product.title) || variantTitle || 'Product';
          const variantImage = variant.image as any;
          const productImage = variant.product?.featuredImage as any;
          const image = variantImage || productImage;
          const price = variant.price as any;

          let priceLabel = '';
          if (price && price.amount && price.currencyCode) {
            priceLabel = i18n.formatCurrency(Number(price.amount), {
              currency: price.currencyCode,
            });
          }

          return {
            ...product,
            title: productTitle,
            imageUrl: (image && image.url) || '',
            imageAlt: (image && image.altText) || productTitle,
            priceLabel,
            loading: false,
            error: '',
          };
        } catch (_error) {
          console.error("Query error:", _error);
          return { 
            ...product, 
            loading: false, 
            error: i18n.translate('failedToLoadProduct') 
          };
        }
      })
    );

    setProducts(updatedProducts);
    setInitialLoading(false);

    console.log("Updated Products:", { updatedProducts });
  }

  useEffect(() => {
    if (products.length === 0) return;
    loadAllProducts();
  }, [products.length, query]);

  // Sync cart state with products
  useEffect(() => {
    const cartLines = shopify.lines.value || [];

    setProducts((prev) =>
      prev.map((product) => {
        const existingLine = cartLines.find(
          (line: any) => line.merchandise?.id === product.merchandiseId
        );

        return {
          ...product,
          isInCart: !!existingLine,
          cartLineId: existingLine?.id || null,
        };
      })
    );
  }, [shopify.lines.value]);

  async function handleCheckboxChange(merchandiseId: string, checked: boolean) {
    const product = products.find((item) => item.merchandiseId === merchandiseId);

    if (!product) return;

    if (checked && canAdd) {
      const result = await shopify.applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId,
        quantity: 1,
      });

      if (result.type === 'success') {
        setProducts((prev) =>
          prev.map((p) =>
            p.merchandiseId === merchandiseId ? { ...p, isInCart: true } : p
          )
        );
      }
    } else if (!checked && canRemove && product.cartLineId) {
      const result = await shopify.applyCartLinesChange({
        type: 'removeCartLine',
        id: product.cartLineId,
        quantity: 1,
      });

      if (result.type === 'success') {
        setProducts((prev) =>
          prev.map((p) =>
            p.merchandiseId === merchandiseId
              ? { ...p, isInCart: false, cartLineId: null }
              : p
          )
        );
      }
    }
  }

  // No products configured
  if (merchandiseIds.length === 0) {
    return (
      <s-banner tone="warning">
        <s-text>{i18n.translate('noProductsConfigured')}</s-text>
      </s-banner>
    );
  }

  if (initialLoading) {
    return (
      <s-banner>
        <s-text>{i18n.translate('loading')}</s-text>
      </s-banner>
    );
  }

  if (!canAdd && !canRemove) {
    return (
      <s-banner tone="warning">
        <s-text>{i18n.translate('cartCannotBeModified')}</s-text>
      </s-banner>
    );
  }

  return (
    <s-stack direction="block" gap="base">
      <s-heading>{sectionHeading}</s-heading>

      {products.map((product) => {
        if (product.loading) {
          return (
            <s-stack key={product.merchandiseId} direction="inline" gap="base">
              <s-text>{i18n.translate('loadingProduct')}</s-text>
            </s-stack>
          );
        }

        if (product.error) {
          return (
            <s-banner key={product.merchandiseId} tone="critical">
              <s-text>{product.error}</s-text>
            </s-banner>
          );
        }

        return (
          <s-stack
            key={product.merchandiseId}
            direction="inline"
            gap="base"
          >
            <s-checkbox
              checked={product.isInCart}
              onChange={() =>
                handleCheckboxChange(product.merchandiseId, !product.isInCart)
              }
            />

            {product.imageUrl && (
              <s-box maxInlineSize="60px">
                <s-image
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  aspectRatio="1/1"
                  inlineSize="auto"
                />
              </s-box>
            )}

            <s-stack direction="block" gap="none">
              <s-text>{product.title}</s-text>
              {product.priceLabel && <s-text>{product.priceLabel}</s-text>}
            </s-stack>
          </s-stack>
        );
      })}
    </s-stack>
  );
}
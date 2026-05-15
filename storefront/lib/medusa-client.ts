import Medusa from "@medusajs/js-sdk"
import type { HttpTypes } from "@medusajs/types"
import type { StoreCart, StoreLineItem, StoreProduct, StoreVariant } from "@/lib/types"

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID
const currencyCode = process.env.NEXT_PUBLIC_MEDUSA_CURRENCY_CODE ?? "inr"

const cartFields =
  "id,email,completed_at,subtotal,total,*items,*items.variant,*payment_collection,*shipping_address"

const productFields =
  "id,title,handle,description,thumbnail,updated_at,*collection,*type,*tags,*variants,+variants.inventory_quantity,*variants.calculated_price"

export const sdk = new Medusa({
  baseUrl,
  publishableKey,
  debug: process.env.NODE_ENV === "development",
})

function productQuery(
  query: HttpTypes.StoreProductListParams = {}
): HttpTypes.StoreProductListParams {
  return {
    ...query,
    fields: query.fields ?? productFields,
    region_id: query.region_id ?? regionId,
  }
}

function normalizeProduct(product: HttpTypes.StoreProduct): StoreProduct {
  return {
    ...product,
    variants: (product.variants ?? []) as StoreVariant[],
    tags: product.tags ?? undefined,
  } as StoreProduct
}

function cartQuery(): HttpTypes.SelectParams {
  return { fields: cartFields }
}

function cartSeed(): HttpTypes.StoreCreateCart {
  return {
    region_id: regionId,
    currency_code: currencyCode,
  }
}

function normalizeProviderId(providerId: string): string {
  if (providerId === "razorpay") {
    return process.env.NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID ?? "pp_system_default"
  }

  return providerId
}

export const medusa = {
  products: {
    list: async (query?: HttpTypes.StoreProductListParams) => {
      const response = await sdk.store.product.list(productQuery(query))

      return {
        ...response,
        products: response.products.map(normalizeProduct),
      }
    },
  },
  carts: {
    create: async () => sdk.store.cart.create(cartSeed(), cartQuery()),
    retrieve: async (cartId: string) => sdk.store.cart.retrieve(cartId, cartQuery()),
    update: async (cartId: string, body: HttpTypes.StoreUpdateCart) =>
      sdk.store.cart.update(cartId, body, cartQuery()),
    addShippingMethod: async (cartId: string, body: { option_id: string; data?: Record<string, unknown> }) =>
      sdk.store.cart.addShippingMethod(cartId, body, cartQuery()),
    createPaymentSessions: async (cartId: string) =>
      sdk.store.cart.retrieve(cartId, cartQuery()),
    setPaymentSession: async (
      cartId: string,
      body: { provider_id: string; data?: Record<string, unknown> }
    ) => {
      const { cart } = await sdk.store.cart.retrieve(cartId, cartQuery())

      return sdk.store.payment.initiatePaymentSession(
        cart,
        {
          provider_id: normalizeProviderId(body.provider_id),
          data: body.data,
        },
        { fields: "*payment_sessions" }
      )
    },
    complete: async (cartId: string) => sdk.store.cart.complete(cartId),
    lineItems: {
      create: async (cartId: string, body: HttpTypes.StoreAddCartLineItem) =>
        sdk.store.cart.createLineItem(cartId, body, cartQuery()),
      update: async (
        cartId: string,
        lineItemId: string,
        body: HttpTypes.StoreUpdateCartLineItem
      ) => sdk.store.cart.updateLineItem(cartId, lineItemId, body, cartQuery()),
      delete: async (cartId: string, lineItemId: string) => {
        const response = await sdk.store.cart.deleteLineItem(
          cartId,
          lineItemId,
          cartQuery()
        )

        return { cart: response.parent }
      },
    },
  },
  fulfillment: {
    listCartOptions: async (cartId: string) =>
      sdk.store.fulfillment.listCartOptions({ cart_id: cartId }),
  },
}

// Re-export useful local storefront types
export type { StoreCart, StoreLineItem, StoreProduct, StoreVariant }

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

export function getVariantPriceAmount(variant?: StoreVariant | null): number | null {
  return (
    variant?.calculated_price?.calculated_amount ??
    variant?.prices?.[0]?.amount ??
    null
  )
}

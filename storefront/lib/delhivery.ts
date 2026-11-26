/**
 * @file lib/delhivery.ts
 * @description Dedicated server-side shipping service for Delhivery API integration.
 *
 * Implements:
 *   1. PIN code serviceability check via Delhivery Pin Codes API:
 *      GET /c/api/pin-codes/json/?filter_codes={pincode}
 *   2. Package dimensions & chargeable weight calculation:
 *      - Actual weight in grams
 *      - Stacking package dimensions (Length = max(L), Width = max(W), Height = sum(H * qty))
 *      - Volumetric weight = (L * W * H) / 5000 kg = (L * W * H) / 5 g
 *      - Chargeable weight = max(actual weight, volumetric weight)
 *   3. Shipping rate calculation via Delhivery Last-Mile Rate API:
 *      GET /api/kinko/v1/invoice/charges/.json?md=S&cgm={grams}&o_pin={originPin}&d_pin={destPin}&ss=Delivered
 *
 * Security:
 *   - Server-side only; DELHIVERY_API_TOKEN is NEVER exposed to the client.
 */

import type { Product } from "@/lib/sheets"

export interface PackageCalculationResult {
  actualWeightGrams: number
  volumetricWeightGrams: number
  chargeableWeightGrams: number
  dimensions: {
    length: number
    width: number
    height: number
  }
}

export interface PackageCalculationError {
  error: string
  missingProduct?: string
}

export interface PincodeServiceabilityResult {
  serviceable: boolean
  pincode: string
  district?: string
  state?: string
  prePaid?: boolean
  cod?: boolean
  error?: string
}

export interface ShippingRateCalculationResult {
  success: boolean
  shippingCharge?: number
  currency?: string
  serviceable?: boolean
  chargeableWeightGrams?: number
  actualWeightGrams?: number
  volumetricWeightGrams?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  shippingProvider: "Delhivery"
  originPincode?: string
  destinationPincode?: string
  error?: string
  unconfigured?: boolean
}

/**
 * Validates whether an Indian PIN code is structurally valid (6 digits, first digit 1-9).
 */
export function isValidPincode(pincode: string | number): boolean {
  const clean = String(pincode || "").trim()
  return /^[1-9][0-9]{5}$/.test(clean)
}

/**
 * Server-only helper to read and validate Delhivery environment configuration.
 */
export function getDelhiveryConfig() {
  const token = (process.env.DELHIVERY_API_TOKEN || "").trim()
  const pickupPincode = (process.env.DELHIVERY_PICKUP_PINCODE || "").trim()
  const rawBaseUrl = (process.env.DELHIVERY_API_BASE_URL || "https://track.delhivery.com").trim()
  const baseUrl = rawBaseUrl.replace(/\/+$/, "")

  const isConfigured = Boolean(token && pickupPincode)

  return {
    token,
    pickupPincode,
    baseUrl,
    isConfigured,
  }
}

/**
 * Calculates total shipment weight and bounding package dimensions for a list of cart products.
 *
 * If any product in the shipment is missing length, width, height, or actualWeight,
 * rate calculation is stopped and the product name is clearly reported.
 */
export function calculatePackageDimensionsAndWeight(
  items: Array<{ product: Product; quantity: number }>
): PackageCalculationResult | PackageCalculationError {
  if (!items || items.length === 0) {
    return { error: "Cart is empty." }
  }

  let totalActualWeightGrams = 0
  let maxSortedL = 0
  let maxSortedW = 0
  let totalStackedH = 0

  for (const item of items) {
    const p = item.product
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))

    const length = Number(p.length)
    const width = Number(p.width)
    const height = Number(p.height)
    const weight = Number(p.actualWeight)

    if (
      !Number.isFinite(length) || length <= 0 ||
      !Number.isFinite(width) || width <= 0 ||
      !Number.isFinite(height) || height <= 0 ||
      !Number.isFinite(weight) || weight <= 0
    ) {
      return {
        error: `Product "${p.name || p.productName || p.id}" is missing dimensions or weight for shipping calculation.`,
        missingProduct: p.name || p.productName || p.id,
      }
    }

    // Convert weight to grams
    const unit = (p.weightUnit || "").trim().toLowerCase()
    const weightInGrams = unit === "kg" ? weight * 1000 : weight
    totalActualWeightGrams += weightInGrams * qty

    // Sort single item dimensions so dim[0] >= dim[1] >= dim[2]
    const dims = [length, width, height].sort((a, b) => b - a)
    const itemL = dims[0]
    const itemW = dims[1]
    const itemH = dims[2]

    if (itemL > maxSortedL) maxSortedL = itemL
    if (itemW > maxSortedW) maxSortedW = itemW
    totalStackedH += itemH * qty
  }

  const finalL = Math.max(1, Math.round(maxSortedL * 10) / 10)
  const finalW = Math.max(1, Math.round(maxSortedW * 10) / 10)
  const finalH = Math.max(1, Math.round(totalStackedH * 10) / 10)

  // Delhivery volumetric weight formula:
  // Volumetric weight (kg) = (L * W * H) / 5000 (with dimensions in cm)
  // Volumetric weight (g) = (L * W * H) / 5
  const volumetricWeightGrams = Math.round((finalL * finalW * finalH) / 5)
  const actualWeightGrams = Math.round(totalActualWeightGrams)
  const chargeableWeightGrams = Math.max(actualWeightGrams, volumetricWeightGrams)

  return {
    actualWeightGrams,
    volumetricWeightGrams,
    chargeableWeightGrams,
    dimensions: {
      length: finalL,
      width: finalW,
      height: finalH,
    },
  }
}

/**
 * Validates PIN code serviceability with Delhivery.
 * Endpoint: GET /c/api/pin-codes/json/?filter_codes={pincode}
 */
export async function checkDelhiveryServiceability(
  pincode: string
): Promise<PincodeServiceabilityResult> {
  const cleanPin = String(pincode || "").trim()
  if (!isValidPincode(cleanPin)) {
    return {
      serviceable: false,
      pincode: cleanPin,
      error: "Please enter a valid 6-digit Indian delivery PIN code.",
    }
  }

  const config = getDelhiveryConfig()
  if (!config.isConfigured) {
    return {
      serviceable: false,
      pincode: cleanPin,
      error: "Delhivery shipping is currently unconfigured on the server.",
    }
  }

  try {
    const url = `${config.baseUrl}/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(cleanPin)}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${config.token}`,
        Accept: "application/json",
      },
      // Cache for 10 minutes to prevent excessive repeat calls for identical pincodes
      next: { revalidate: 600 },
    })

    if (!res.ok) {
      console.error(`Delhivery serviceability API error: ${res.status} ${res.statusText}`)
      return {
        serviceable: false,
        pincode: cleanPin,
        error: "Unable to calculate shipping charges. Please try again.",
      }
    }

    const data = await res.json()
    const codes = data?.delivery_codes
    if (!Array.isArray(codes) || codes.length === 0) {
      return {
        serviceable: false,
        pincode: cleanPin,
        error: "Delivery is not available at this PIN code.",
      }
    }

    const postalCode = codes[0]?.postal_code
    if (!postalCode) {
      return {
        serviceable: false,
        pincode: cleanPin,
        error: "Delivery is not available at this PIN code.",
      }
    }

    // Check prepaid delivery support
    const prePaid = String(postalCode.pre_paid || "").toUpperCase() === "Y"
    const cod = String(postalCode.cod || "").toUpperCase() === "Y"

    if (!prePaid) {
      return {
        serviceable: false,
        pincode: cleanPin,
        prePaid,
        cod,
        error: "Delivery is not available at this PIN code.",
      }
    }

    return {
      serviceable: true,
      pincode: cleanPin,
      district: postalCode.district,
      state: postalCode.state_code,
      prePaid,
      cod,
    }
  } catch (err: any) {
    console.error("Delhivery serviceability network error:", err)
    return {
      serviceable: false,
      pincode: cleanPin,
      error: "Unable to calculate shipping charges. Please try again.",
    }
  }
}

/**
 * Calculates live shipping charges via Delhivery Last-Mile Rate API.
 * Endpoint: GET /api/kinko/v1/invoice/charges/.json?md=S&cgm={grams}&o_pin={originPin}&d_pin={destPin}&ss=Delivered
 */
export async function calculateDelhiveryShippingRate(params: {
  destinationPincode: string
  items: Array<{ product: Product; quantity: number }>
}): Promise<ShippingRateCalculationResult> {
  const cleanPin = String(params.destinationPincode || "").trim()

  if (!isValidPincode(cleanPin)) {
    return {
      success: false,
      shippingProvider: "Delhivery",
      error: "Please enter a valid 6-digit delivery PIN code.",
    }
  }

  // 1. Calculate weight & packaging
  const packageResult = calculatePackageDimensionsAndWeight(params.items)
  if ("error" in packageResult) {
    return {
      success: false,
      shippingProvider: "Delhivery",
      error: packageResult.error,
    }
  }

  const config = getDelhiveryConfig()
  if (!config.isConfigured) {
    return {
      success: false,
      unconfigured: true,
      shippingProvider: "Delhivery",
      chargeableWeightGrams: packageResult.chargeableWeightGrams,
      actualWeightGrams: packageResult.actualWeightGrams,
      volumetricWeightGrams: packageResult.volumetricWeightGrams,
      dimensions: packageResult.dimensions,
      error: "Unable to calculate shipping charges. Delhivery API credentials not configured.",
    }
  }

  // 2. Validate PIN code serviceability
  const serviceability = await checkDelhiveryServiceability(cleanPin)
  if (!serviceability.serviceable) {
    return {
      success: false,
      serviceable: false,
      shippingProvider: "Delhivery",
      chargeableWeightGrams: packageResult.chargeableWeightGrams,
      actualWeightGrams: packageResult.actualWeightGrams,
      volumetricWeightGrams: packageResult.volumetricWeightGrams,
      dimensions: packageResult.dimensions,
      destinationPincode: cleanPin,
      originPincode: config.pickupPincode,
      error: serviceability.error || "Delivery is not available at this PIN code.",
    }
  }

  // 3. Query Delhivery Last-Mile Rate API
  try {
    const queryParams = new URLSearchParams({
      md: "S", // Surface mode
      cgm: String(packageResult.chargeableWeightGrams),
      o_pin: config.pickupPincode,
      d_pin: cleanPin,
      ss: "Delivered",
    })

    const url = `${config.baseUrl}/api/kinko/v1/invoice/charges/.json?${queryParams.toString()}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${config.token}`,
        Accept: "application/json",
      },
    })

    if (!res.ok) {
      console.error(`Delhivery rate API error: ${res.status} ${res.statusText}`)
      return {
        success: false,
        shippingProvider: "Delhivery",
        error: "Unable to calculate shipping charges. Please try again.",
      }
    }

    const data = await res.json()
    // Delhivery charges endpoint returns an array of rate quotes
    const quote = Array.isArray(data) ? data[0] : data
    const rawTotal = quote?.total_amount != null ? Number(quote.total_amount) : null

    if (rawTotal === null || !Number.isFinite(rawTotal) || rawTotal <= 0) {
      console.error("Delhivery returned invalid rate response:", data)
      return {
        success: false,
        shippingProvider: "Delhivery",
        error: "Unable to calculate shipping charges. Please try again.",
      }
    }

    const shippingCharge = Math.round(rawTotal * 100) / 100

    return {
      success: true,
      serviceable: true,
      shippingCharge,
      currency: "INR",
      shippingProvider: "Delhivery",
      chargeableWeightGrams: packageResult.chargeableWeightGrams,
      actualWeightGrams: packageResult.actualWeightGrams,
      volumetricWeightGrams: packageResult.volumetricWeightGrams,
      dimensions: packageResult.dimensions,
      originPincode: config.pickupPincode,
      destinationPincode: cleanPin,
    }
  } catch (err: any) {
    console.error("Delhivery rate calculation network error:", err)
    return {
      success: false,
      shippingProvider: "Delhivery",
      error: "Unable to calculate shipping charges. Please try again.",
    }
  }
}

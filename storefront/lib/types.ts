export interface StoreMoneyAmount {
  amount: number
  currency_code?: string
}

export interface StoreVariant {
  id?: string
  title?: string
  inventory_quantity?: number
  prices?: StoreMoneyAmount[]
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
    currency_code?: string | null
  }
}

export interface StoreProduct {
  id?: string
  title?: string | null
  handle?: string | null
  description?: string | null
  thumbnail?: string | null
  updated_at?: string | Date | null
  collection?: { title?: string | null } | null
  type?: { value?: string | null } | null
  tags?: Array<{ value?: string | null }>
  variants: StoreVariant[]
}

export interface StoreLineItem {
  id: string
  title: string
  description?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price?: number | null
}

export interface StoreCart {
  id: string
  completed_at?: string | Date | null
  subtotal?: number | null
  items?: StoreLineItem[]
  payment_collection?: unknown
}

import rateLimit from "express-rate-limit"
import { defineMiddlewares } from "@medusajs/framework/http"

const storeCartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: "rate_limit_exceeded",
    message: "Too many requests. Please try again shortly.",
  },
})

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: "rate_limit_exceeded",
    message: "Too many checkout attempts. Please try again shortly.",
  },
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/carts",
      method: "POST",
      middlewares: [storeCartLimiter],
    },
    {
      matcher: "/store/carts/:id/line-items",
      method: "POST",
      middlewares: [storeCartLimiter],
    },
    {
      matcher: "/store/carts/:id/complete",
      method: "POST",
      middlewares: [checkoutLimiter],
    },
  ],
})

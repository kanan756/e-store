"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"

interface OrderItem {
  orderId: string
  customerName: string
  email: string
  product: string
  amount: number
  status: string
  comments: string
}

export default function AccountClient() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "password">(
    tabParam === "orders" ? "orders" : "profile"
  )

  const { wishlistCount } = useWishlist()
  const { totalItems, subtotal } = useCart()

  // Profile Form state
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    email: "",
    provider: "credentials",
    role: "customer",
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passSaving, setPassSaving] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Orders state
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account")
    }
  }, [status, router])

  // Fetch Profile & Orders
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      // 1. Fetch Profile
      fetch("/api/customer/profile")
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) {
            setProfile({
              fullName: data.fullName || session.user?.name || "",
              username: data.username || (session.user as any)?.username || "",
              phoneNumber: data.phoneNumber || "",
              email: data.email || session.user?.email || "",
              provider: data.provider || "credentials",
              role: data.role || "customer",
            })
          }
        })
        .catch(console.error)
        .finally(() => setProfileLoading(false))

      // 2. Fetch Orders
      fetch(`/api/orders?email=${encodeURIComponent(session.user.email)}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.orders)) {
            setOrders(data.orders)
          }
        })
        .catch(console.error)
        .finally(() => setOrdersLoading(false))
    }
  }, [status, session])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          username: profile.username,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")
      if (update) {
        await update({ name: profile.fullName, username: profile.username })
      }
      setProfileMsg({ type: "success", text: "Profile updated successfully!" })
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassSaving(true)
    setPassMsg(null)

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "New passwords do not match" })
      setPassSaving(false)
      return
    }

    try {
      const res = await fetch("/api/customer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to change password")
      setPassMsg({ type: "success", text: "Password changed successfully!" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPassMsg({ type: "error", text: err.message })
    } finally {
      setPassSaving(false)
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#747474", fontSize: 16 }}>Loading your account…</div>
      </div>
    )
  }

  return (
    <div style={{ background: "#F5F5F5", minHeight: "100vh", paddingTop: 130, paddingBottom: 80 }}>
      <div className="W">
        {/* Account Header Banner */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid #E5E5E5",
            padding: "32px 36px",
            marginBottom: 32,
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#FFF0E5",
                color: "#F36B12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 900,
                border: "2px solid #FFE4D1",
              }}
            >
              {(profile.fullName || session?.user?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#17191C", margin: 0 }}>
                  {profile.fullName || session?.user?.name || "Customer"}
                </h1>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "3px 10px",
                    borderRadius: 9999,
                    background: "#FFF0E5",
                    color: "#F36B12",
                  }}
                >
                  Verified Customer
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#747474", marginTop: 4 }}>
                {profile.email} &middot; @{profile.username || "user"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                padding: "10px 20px",
                background: "#FFFFFF",
                border: "1.5px solid #E5E5E5",
                color: "#747474",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#DC2626")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E5E5E5")}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            onClick={() => setActiveTab("orders")}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              padding: "20px 24px",
              cursor: "pointer",
              transition: "transform 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#747474", textTransform: "uppercase" }}>My Orders</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#17191C", marginTop: 6 }}>{orders.length}</div>
            <div style={{ fontSize: 12, color: "#F36B12", fontWeight: 700, marginTop: 4 }}>View history &rarr;</div>
          </div>

          <Link
            href="/cart"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              padding: "20px 24px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#747474", textTransform: "uppercase" }}>Shopping Cart</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#17191C", marginTop: 6 }}>{totalItems} items</div>
            <div style={{ fontSize: 12, color: "#F36B12", fontWeight: 700, marginTop: 4 }}>Subtotal: {formatPrice(subtotal)} &rarr;</div>
          </Link>

          <Link
            href="/shop"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              padding: "20px 24px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#747474", textTransform: "uppercase" }}>Wishlist Saved</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#17191C", marginTop: 6 }}>{wishlistCount} items</div>
            <div style={{ fontSize: 12, color: "#F36B12", fontWeight: 700, marginTop: 4 }}>Explore shop &rarr;</div>
          </Link>

          <Link
            href="/track-order"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              padding: "20px 24px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#747474", textTransform: "uppercase" }}>Live Shipment</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#17191C", marginTop: 10 }}>Track Orders</div>
            <div style={{ fontSize: 12, color: "#F36B12", fontWeight: 700, marginTop: 8 }}>Real-time updates &rarr;</div>
          </Link>
        </div>

        {/* Main Tabs Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "start" }}>
          {/* Sidebar Nav */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid #E5E5E5",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: activeTab === "profile" ? "#FFF0E5" : "transparent",
                color: activeTab === "profile" ? "#F36B12" : "#17191C",
                fontWeight: activeTab === "profile" ? 800 : 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              👤 Profile &amp; Details
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: activeTab === "orders" ? "#FFF0E5" : "transparent",
                color: activeTab === "orders" ? "#F36B12" : "#17191C",
                fontWeight: activeTab === "orders" ? 800 : 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              📦 My Orders ({orders.length})
            </button>

            {profile.provider === "credentials" && (
              <button
                onClick={() => setActiveTab("password")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: activeTab === "password" ? "#FFF0E5" : "transparent",
                  color: activeTab === "password" ? "#F36B12" : "#17191C",
                  fontWeight: activeTab === "password" ? 800 : 600,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                🔒 Change Password
              </button>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "#DC2626",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                marginTop: 12,
                borderTop: "1px solid #E5E5E5",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              🚪 Sign Out
            </button>
          </div>

          {/* Tab Content Box */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid #E5E5E5",
              padding: "36px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            {/* 1. Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#17191C", marginBottom: 6 }}>
                  Personal Information
                </h2>
                <p style={{ fontSize: 14, color: "#747474", marginBottom: 28 }}>
                  View and update your personal details and contact numbers.
                </p>

                {profileMsg && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      marginBottom: 20,
                      fontSize: 14,
                      fontWeight: 600,
                      background: profileMsg.type === "success" ? "#F0FDF4" : "#FEF2F2",
                      border: `1px solid ${profileMsg.type === "success" ? "#86EFAC" : "#FCA5A5"}`,
                      color: profileMsg.type === "success" ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {profileMsg.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1.5px solid #E5E5E5",
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                        Username
                      </label>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1.5px solid #E5E5E5",
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                        Email Address (Verified)
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1.5px solid #E5E5E5",
                          fontSize: 14,
                          background: "#F5F5F5",
                          color: "#747474",
                          cursor: "not-allowed",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1.5px solid #E5E5E5",
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    style={{
                      alignSelf: "flex-start",
                      padding: "12px 28px",
                      background: "#F36B12",
                      color: "#FFFFFF",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 14,
                      border: "none",
                      cursor: profileSaving ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 12px rgba(243, 107, 18, 0.25)",
                    }}
                  >
                    {profileSaving ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {/* 2. Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#17191C", marginBottom: 6 }}>
                  Order History
                </h2>
                <p style={{ fontSize: 14, color: "#747474", marginBottom: 24 }}>
                  Real-time status of your purchases with CLASPO.
                </p>

                {ordersLoading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#747474" }}>Loading your orders…</div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#17191C", marginBottom: 8 }}>No orders placed yet</h3>
                    <p style={{ fontSize: 14, color: "#747474", marginBottom: 20 }}>
                      Explore our collections and make your everyday living simpler and smarter.
                    </p>
                    <Link
                      href="/shop"
                      style={{
                        display: "inline-block",
                        padding: "12px 24px",
                        background: "#F36B12",
                        color: "#FFFFFF",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 14,
                        textDecoration: "none",
                      }}
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {orders.map((o) => (
                      <div
                        key={o.orderId}
                        style={{
                          border: "1px solid #E5E5E5",
                          borderRadius: 14,
                          padding: "20px 24px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 16,
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontWeight: 800, color: "#17191C", fontSize: 15 }}>#{o.orderId}</span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                padding: "3px 10px",
                                borderRadius: 9999,
                                background: o.status === "Delivered" ? "#F0FDF4" : "#FFF0E5",
                                color: o.status === "Delivered" ? "#16A34A" : "#F36B12",
                              }}
                            >
                              {o.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, color: "#747474", marginTop: 4 }}>{o.product}</div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 17, fontWeight: 900, color: "#17191C" }}>
                              {formatPrice(o.amount)}
                            </div>
                          </div>
                          <Link
                            href="/track-order"
                            style={{
                              padding: "8px 16px",
                              background: "#F5F5F5",
                              border: "1px solid #E5E5E5",
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#17191C",
                              textDecoration: "none",
                            }}
                          >
                            Track &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Password Tab */}
            {activeTab === "password" && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#17191C", marginBottom: 6 }}>
                  Change Password
                </h2>
                <p style={{ fontSize: 14, color: "#747474", marginBottom: 28 }}>
                  Keep your account safe by using a strong, unique password.
                </p>

                {passMsg && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      marginBottom: 20,
                      fontSize: 14,
                      fontWeight: 600,
                      background: passMsg.type === "success" ? "#F0FDF4" : "#FEF2F2",
                      border: `1px solid ${passMsg.type === "success" ? "#86EFAC" : "#FCA5A5"}`,
                      color: passMsg.type === "success" ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {passMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 440 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1.5px solid #E5E5E5",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                      New Password (Min 8 characters, 1 uppercase, 1 number)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1.5px solid #E5E5E5",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1.5px solid #E5E5E5",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passSaving}
                    style={{
                      alignSelf: "flex-start",
                      padding: "12px 28px",
                      background: "#F36B12",
                      color: "#FFFFFF",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 14,
                      border: "none",
                      cursor: passSaving ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 12px rgba(243, 107, 18, 0.25)",
                    }}
                  >
                    {passSaving ? "Updating…" : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

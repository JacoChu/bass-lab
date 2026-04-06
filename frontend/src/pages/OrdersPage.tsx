import { useState, useEffect } from 'react'

interface Order {
  id: number
  status: 'confirmed' | 'cancelled'
  period: 'monthly' | 'yearly'
  amount_cents: number
  expires_at: string | null
  created_at: string
}

interface Profile {
  trial_sessions_used: number
}

function formatCurrency(cents: number) {
  return `NT$${(cents / 100).toLocaleString('zh-TW', { minimumFractionDigits: 0 })}`
}

function formatPeriod(period: string) {
  return period === 'monthly' ? 'Monthly' : 'Yearly'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelError, setCancelError] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/profile', { credentials: 'include' }).then((r) => r.json()),
    ]).then(([ordersData, profileData]) => {
      setOrders(ordersData)
      setProfile(profileData)
      setLoading(false)
    })
  }, [])

  // Subscription status summary
  const now = new Date()
  const activeOrder = orders
    .filter((o) => o.status === 'confirmed' && o.expires_at && new Date(o.expires_at) > now)
    .sort((a, b) => new Date(b.expires_at!).getTime() - new Date(a.expires_at!).getTime())[0]

  async function handleCancel(id: number) {
    setCancelError('')
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o))
      )
      setConfirmId(null)
    } else {
      setCancelError('取消失敗，請稍後再試')
      setConfirmId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">訂單紀錄</h1>

      {/* Subscription status summary */}
      <div className="card bg-base-200 p-4 space-y-2">
        <p className="font-medium">
          {activeOrder
            ? `訂閱中：有效至 ${activeOrder.expires_at}`
            : '目前無有效訂閱'}
        </p>
        <p className="text-sm text-base-content/70">
          免費試用：已使用 {profile?.trial_sessions_used ?? 0} / 2 次
        </p>
      </div>

      {cancelError && (
        <div className="alert alert-error text-sm">{cancelError}</div>
      )}

      {/* Orders list */}
      {orders.length === 0 ? (
        <p className="text-center text-base-content/60 py-12">目前沒有訂閱紀錄</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>方案</th>
                <th>金額</th>
                <th>狀態</th>
                <th>到期日</th>
                <th>建立日期</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{formatPeriod(order.period)}</td>
                  <td>{formatCurrency(order.amount_cents)}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        order.status === 'confirmed' ? 'badge-success' : 'badge-ghost'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.expires_at ?? '—'}</td>
                  <td>{order.created_at}</td>
                  <td>
                    {order.status === 'confirmed' && (
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() => setConfirmId(order.id)}
                      >
                        取消訂閱
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm cancel dialog */}
      {confirmId !== null && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">確認取消</h3>
            <p className="py-4">確定要取消此訂閱嗎？取消後無法復原。</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>
                返回
              </button>
              <button className="btn btn-error" onClick={() => handleCancel(confirmId)}>
                確定取消
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmId(null)} />
        </dialog>
      )}
    </div>
  )
}

import { useState, useEffect, FormEvent } from 'react'

interface Profile {
  display_name: string
  email: string
  trial_sessions_used: number
  otp_required_for_login: boolean
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  // Display name section
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameMsg, setNameMsg] = useState('')
  const [nameError, setNameError] = useState('')

  // Password section
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  // Email section
  const [emailInput, setEmailInput] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')

  // 2FA section
  const [qrSvg, setQrSvg] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [twoFaMsg, setTwoFaMsg] = useState('')
  const [twoFaError, setTwoFaError] = useState('')
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data)
        setNameInput(data.display_name)
        setEmailInput(data.email)
      })
  }, [])

  async function handleNameSubmit(e: FormEvent) {
    e.preventDefault()
    setNameMsg('')
    setNameError('')
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: nameInput }),
    })
    const data = await res.json()
    if (res.ok) {
      setProfile((p) => p ? { ...p, display_name: data.display_name } : p)
      setNameMsg('顯示名稱已更新')
      setEditingName(false)
    } else {
      setNameError(data.errors?.join(', ') ?? '更新失敗')
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPwMsg('')
    setPwError('')
    const res = await fetch('/api/profile/password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw, new_password_confirmation: confirmPw }),
    })
    const data = await res.json()
    if (res.ok) {
      setPwMsg('密碼已更新')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } else {
      setPwError(data.error ?? data.errors?.join(', ') ?? '更新失敗')
    }
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    setEmailMsg('')
    setEmailError('')
    const res = await fetch('/api/profile/email', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput }),
    })
    const data = await res.json()
    if (res.ok) {
      setEmailMsg(data.message)
    } else {
      setEmailError(data.errors?.join(', ') ?? '更新失敗')
    }
  }

  async function handle2FaSetup() {
    setTwoFaMsg('')
    setTwoFaError('')
    const res = await fetch('/users/two_factor/setup', { credentials: 'include' })
    const data = await res.json()
    if (res.ok) {
      setQrSvg(data.qr_svg)
      setShowQr(true)
    } else {
      setTwoFaError('無法取得 QR Code')
    }
  }

  async function handle2FaEnable(e: FormEvent) {
    e.preventDefault()
    setTwoFaMsg('')
    setTwoFaError('')
    const res = await fetch('/users/two_factor/enable', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp_attempt: otpInput }),
    })
    const data = await res.json()
    if (res.ok) {
      setProfile((p) => p ? { ...p, otp_required_for_login: true } : p)
      setTwoFaMsg('2FA 已啟用')
      setShowQr(false)
      setOtpInput('')
    } else {
      setTwoFaError(data.error ?? '驗證失敗')
    }
  }

  async function handle2FaDisable() {
    setTwoFaMsg('')
    setTwoFaError('')
    const res = await fetch('/users/two_factor', { method: 'DELETE', credentials: 'include' })
    if (res.ok) {
      setProfile((p) => p ? { ...p, otp_required_for_login: false } : p)
      setTwoFaMsg('2FA 已停用')
    } else {
      setTwoFaError('停用失敗')
    }
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">個人資料</h1>

      {/* Display name */}
      <section className="card bg-base-200 p-4 space-y-3">
        <h2 className="font-semibold text-lg">顯示名稱</h2>
        {editingName ? (
          <form onSubmit={handleNameSubmit} className="flex gap-2">
            <input
              className="input input-bordered flex-1"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="顯示名稱"
            />
            <button type="submit" className="btn btn-primary btn-sm">儲存</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingName(false)}>取消</button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-base">{profile.display_name}</span>
            <button className="btn btn-ghost btn-xs" onClick={() => setEditingName(true)}>編輯</button>
          </div>
        )}
        {nameMsg && <p className="text-success text-sm">{nameMsg}</p>}
        {nameError && <p className="text-error text-sm">{nameError}</p>}
      </section>

      {/* Password change */}
      <section className="card bg-base-200 p-4 space-y-3">
        <h2 className="font-semibold text-lg">修改密碼</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-2">
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="目前密碼"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="新密碼"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="確認新密碼"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">更新密碼</button>
        </form>
        {pwMsg && <p className="text-success text-sm">{pwMsg}</p>}
        {pwError && <p className="text-error text-sm">{pwError}</p>}
      </section>

      {/* Email change */}
      <section className="card bg-base-200 p-4 space-y-3">
        <h2 className="font-semibold text-lg">修改 Email</h2>
        <form onSubmit={handleEmailSubmit} className="flex gap-2">
          <input
            type="email"
            className="input input-bordered flex-1"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="新 Email"
          />
          <button type="submit" className="btn btn-primary btn-sm">送出</button>
        </form>
        {emailMsg && <p className="text-success text-sm">{emailMsg}</p>}
        {emailError && <p className="text-error text-sm">{emailError}</p>}
      </section>

      {/* 2FA management */}
      <section className="card bg-base-200 p-4 space-y-3">
        <h2 className="font-semibold text-lg">雙重驗證（2FA）</h2>
        <p className="text-sm">
          狀態：<span className={profile.otp_required_for_login ? 'text-success font-medium' : 'text-warning font-medium'}>
            {profile.otp_required_for_login ? '已啟用' : '未啟用'}
          </span>
        </p>

        {!profile.otp_required_for_login && !showQr && (
          <button className="btn btn-outline btn-sm" onClick={handle2FaSetup}>啟用 2FA</button>
        )}

        {showQr && (
          <div className="space-y-3">
            <p className="text-sm">請用 Authenticator App 掃描 QR Code：</p>
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="bg-white p-2 inline-block rounded" />
            <form onSubmit={handle2FaEnable} className="flex gap-2">
              <input
                className="input input-bordered w-36"
                placeholder="驗證碼"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={6}
              />
              <button type="submit" className="btn btn-primary btn-sm">確認啟用</button>
            </form>
          </div>
        )}

        {profile.otp_required_for_login && (
          <button className="btn btn-error btn-outline btn-sm" onClick={handle2FaDisable}>停用 2FA</button>
        )}

        {twoFaMsg && <p className="text-success text-sm">{twoFaMsg}</p>}
        {twoFaError && <p className="text-error text-sm">{twoFaError}</p>}
      </section>
    </div>
  )
}

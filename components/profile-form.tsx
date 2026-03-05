"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserProfile, updateUserPreferences, type UserPreferences } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

interface ProfileFormProps {
  profile: {
    displayName: string | null
    avatarUrl: string | null
    preferences: any
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState(profile.displayName || "")
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "")

  const preferences = (profile.preferences as UserPreferences) || {}
  const [theme, setTheme] = useState<"light" | "dark" | "system">(preferences.theme || "system")
  const [defaultPrivacy, setDefaultPrivacy] = useState<"public" | "private">(preferences.defaultPrivacy || "private")

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("displayName", displayName)
      formData.append("avatarUrl", avatarUrl)

      await updateUserProfile(formData)
      toast.success("個人資料已更新")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "更新失敗")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePreferences = async () => {
    setLoading(true)

    try {
      await updateUserPreferences({
        theme,
        defaultPrivacy,
      })
      toast.success("偏好設定已更新")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "更新失敗")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Information Form */}
      <form onSubmit={handleSubmitProfile} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">暱稱</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="輸入你的暱稱"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
          />
          <p className="text-sm text-slate-500">
            這個名稱會顯示在你的個人資料中
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatarUrl">頭像連結</Label>
          <Input
            id="avatarUrl"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            disabled={loading}
          />
          <p className="text-sm text-slate-500">
            輸入圖片連結作為你的頭像
          </p>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "儲存中..." : "儲存變更"}
        </Button>
      </form>

      {/* Divider */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">偏好設定</h3>

        {/* Theme Preference */}
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-base">主題</Label>
            <p className="text-sm text-slate-500 mb-3">
              選擇你偏好的介面主題（即將推出）
            </p>
            <RadioGroup value={theme} onValueChange={(value: any) => setTheme(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="font-normal cursor-pointer">
                  淺色模式
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="font-normal cursor-pointer">
                  深色模式
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="font-normal cursor-pointer">
                  跟隨系統設定
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Default Privacy */}
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-base">預設隱私設定</Label>
            <p className="text-sm text-slate-500 mb-3">
              新播放清單的預設隱私設定
            </p>
            <RadioGroup value={defaultPrivacy} onValueChange={(value: any) => setDefaultPrivacy(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="font-normal cursor-pointer">
                  私人（只有你能看到）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="font-normal cursor-pointer">
                  公開（任何人都能看到）
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Button onClick={handleUpdatePreferences} disabled={loading}>
          {loading ? "儲存中..." : "儲存偏好設定"}
        </Button>
      </div>
    </div>
  )
}

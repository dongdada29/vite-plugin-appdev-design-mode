import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

const UserSet: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'
  });

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('头像文件不能超过 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('请选择有效的图片文件');
      return;
    }

    setIsLoading(true);

    try {
      // 创建临时 URL 用于预览
      const tempUrl = URL.createObjectURL(file);

      // 模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 实际项目中这里应该上传到服务器
      // 这里我们创建一个更可靠的头像 URL
      const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;

      setProfile(prev => ({
        ...prev,
        avatar: newAvatarUrl
      }));

      // 清理临时 URL
      URL.revokeObjectURL(tempUrl);

      toast.success('头像更新成功');
    } catch (error) {
      console.error('头像上传失败:', error);
      toast.error('头像上传失败，请重试');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);

    try {
      // 模拟保存过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('个人信息保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const getAvatarSrc = (avatarUrl?: string) => {
    // 如果没有头像URL，返回空
    if (!avatarUrl) return '';

    // 如果是相对路径，返回绝对路径
    if (avatarUrl.startsWith('/')) {
      return avatarUrl;
    }

    // 如果已经是完整的URL，直接返回
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    // 其他情况，添加默认URL前缀
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarUrl)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">个人设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 头像设置 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-border shadow-lg">
                <AvatarImage
                  src={getAvatarSrc(profile.avatar)}
                  alt="用户头像"
                  className="object-cover"
                  onError={(e) => {
                    // 图片加载失败时使用备用头像
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <AvatarFallback className="avatar-fallback text-lg font-semibold bg-primary text-primary-foreground">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <p className="text-sm text-muted-foreground">
              支持 JPG、PNG 格式，文件大小不超过 5MB
            </p>
          </div>

          {/* 个人信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={handleInputChange('name')}
                placeholder="请输入姓名"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={handleInputChange('email')}
                placeholder="请输入邮箱"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={handleInputChange('phone')}
                placeholder="请输入手机号"
                className="w-full"
              />
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleProfileUpdate}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>保存中...</span>
                </div>
              ) : (
                '保存修改'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSet;
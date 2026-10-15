import { useSettings } from "@/hooks/use-settings";
import Link from "next/link";

export function Footer() {
  const { settings } = useSettings('basic');

  const socialLinks = [
    {
      key: 'contactEmail',
      icon: 'ri-mail-line',
      label: '联系陆山君'
    },
    {
      key: 'githubUrl',
      icon: 'ri-github-fill',
      label: 'GitHub'
    },
    {
      key: 'twitterUrl',
      icon: 'ri-twitter-x-fill',
      label: '推特'
    }
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4">
          {/* 左侧版权信息 */}
          {(
            <div className="text-sm text-muted-foreground order-first md:order-none flex items-center gap-1">
              <img src="/brand-icon.svg" alt="陆山君の小窝标志" className="h-5 w-5" />
              <Link
                href="/"
                className="text-primary hover:text-primary/90 transition-colors"
              >
                {settings.websiteName || '陆山君の小窝'}
              </Link>
            </div>
          )}

          {/* 网站版权与开源许可 */}

          <div className="text-sm text-muted-foreground text-center md:text-left">
            <span>{settings.copyrightText}</span>
            <Link href="/LICENSE.txt" className="ml-3 underline underline-offset-4">
              开源许可
            </Link>
          </div>

          {/* 右侧社交媒体链接 */}
          <div className="flex items-center space-x-4">
            {socialLinks.map(({ key, icon, label }) => 
              (key === 'contactEmail' ? settings[key] : settings[key]) && (
                <Link
                  key={key}
                  href={key === 'contactEmail' ? `mailto:${settings[key]}` : settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={label}
                >
                  <i className={`${icon} h-6 w-6`} />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
} 

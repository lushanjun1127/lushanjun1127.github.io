import { prisma } from "@/lib/prisma";

const DEFAULT_RETENTION_DAYS = 180;

function getRetentionDays(): number {
  const raw = process.env.ANALYTICS_RETENTION_DAYS;
  if (!raw) return DEFAULT_RETENTION_DAYS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_RETENTION_DAYS;
  return Math.min(3650, Math.floor(n)); // 上限 10 年，防止误配为 0/负数清空全表
}

let lastCleanupAt = 0;
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 每 6 小时最多清理一次

/**
 * 清理过期的访问日志，防止 AccessLog 表无限增长。
 * 保留天数通过环境变量 ANALYTICS_RETENTION_DAYS 配置（默认 180 天）。
 * 内部做了节流：高频调用下每 6 小时实际执行一次删除；失败不影响主流程。
 */
export async function cleanupAccessLogs(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;

  try {
    const days = getRetentionDays();
    const cutoff = new Date(now - days * 86400000);
    const { count } = await prisma.accessLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) {
      console.log(`[analytics] 已清理 ${count} 条超过 ${days} 天的访问日志`);
    }
  } catch (error) {
    console.error("[analytics] 访问日志清理失败:", error);
  }
}

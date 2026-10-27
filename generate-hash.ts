import bcrypt from 'bcryptjs';

async function main() {
  // 从命令行参数或环境变量读取密码，避免在源码中硬编码默认口令
  const password = process.argv[2] || process.env.TEMP_ADMIN_PASSWORD;
  if (!password) {
    console.error('用法: pnpm generate-hash <密码>');
    console.error('或:   TEMP_ADMIN_PASSWORD=<密码> pnpm generate-hash');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  console.log('请将以下值配置到 ADMIN_PASSWORD_HASH（明文密码不会显示）：');
  console.log(hash);

  // 验证
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification:', isValid);
}

main().catch(console.error);

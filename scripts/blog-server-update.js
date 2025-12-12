import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前脚本所在的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义源目录和目标目录
const sourceDir = path.join(__dirname, "../blog-server");
const destDir = path.join(__dirname, "../server");

// 定义需要复制的文件夹和文件列表
const dirsToCopy = [
  "config",
  "controllers",
  "middlewares",
  "models",
  "routes",
  "utils",
];
const filesToCopy = [".env", "app.js", "package-lock.json", "package.json"];

async function copyAndConfigureServer() {
  try {
    console.log(`开始将文件从 ${sourceDir} 复制到 ${destDir}...`);

    // 1. 创建目标文件夹
    await fs.mkdir(destDir, { recursive: true });
    console.log(`- 目标文件夹 ${destDir} 已创建或已存在。`);

    // 2. 复制所有指定的文件夹
    for (const dir of dirsToCopy) {
      const sourcePath = path.join(sourceDir, dir);
      const destPath = path.join(destDir, dir);
      await fs.cp(sourcePath, destPath, { recursive: true });
      console.log(`  - 文件夹 '${dir}' 已成功复制。`);
    }

    // 3. 复制所有指定的文件
    for (const file of filesToCopy) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      await fs.copyFile(sourcePath, destPath);
      console.log(`  - 文件 '${file}' 已成功复制。`);
    }

    console.log("\n文件和文件夹复制完成。现在开始修改环境配置...");

    // 4. 【新增】修改目标文件夹中的 env.js 配置
    const envFilePath = path.join(destDir, "config", "env.js");
    const originalContent = await fs.readFile(envFilePath, "utf-8");

    const developmentString = "envConfig['development']";
    const productionString = "envConfig['production']";

    if (originalContent.includes(developmentString)) {
      const newContent = originalContent.replace(
        developmentString,
        productionString
      );
      await fs.writeFile(envFilePath, newContent, "utf-8");
      console.log(`- 成功将 ${envFilePath} 的环境切换为 'production'。`);
    } else {
      console.log(`- ${envFilePath} 已经是 'production' 环境，无需修改。`);
    }

    console.log("\n所有操作已成功完成！");
  } catch (error) {
    console.error("\n脚本执行过程中发生错误:", error);
  }
}

// 执行脚本
copyAndConfigureServer();

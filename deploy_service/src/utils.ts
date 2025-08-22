import { spawn } from "child_process";
import path from "path";

export async function buildProject(id: string) {
  const projectPath = path.join(__dirname, `output/${id}`);

  // Step 1: Install dependencies
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["install"], { cwd: projectPath, shell: true, stdio: "inherit" });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error("npm install failed"))));
  });

  // Step 2: Build the project
  return new Promise<void>((resolve, reject) => {
    const child = spawn("npx", ["vite", "build"], { cwd: projectPath, shell: true, stdio: "inherit" });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error("Build failed"))));
  });
}

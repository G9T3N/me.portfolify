import { type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export const getBaseConfig = (): UserConfig => ({
  plugins: [tsconfigPaths()],
  server: {
    port: 3000,
  },
});

import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import { getBaseConfig } from "./base";

export const getReactRouterConfig = (config?: UserConfig): UserConfig => {
  return mergeConfig(
    getBaseConfig(),
    defineConfig({
      plugins: [reactRouter()],
      ...config,
    }),
  );
};

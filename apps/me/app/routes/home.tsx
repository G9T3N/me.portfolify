// @ts-ignore
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Home | MRERR" }, { name: "description", content: "Welcome to MRERR" }];
}

export default function Home() {
  return (
    <main>
      <h1>Welcome</h1>
    </main>
  );
}

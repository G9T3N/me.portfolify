// import type { Route } from "./+types/home";
export namespace Route {
  export type MetaArgs = any;
}

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

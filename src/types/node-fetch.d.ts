declare module "node-fetch" {
  import original from "node-fetch";
  const fetch: typeof original;
  export default fetch;
}

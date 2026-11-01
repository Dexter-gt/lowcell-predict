# Going live: Polymarket data + Privy login + real trading

Written against the official docs as of Oct 2026 (docs.polymarket.com, docs.privy.io). Both services change often, so re-check the linked pages before you build. The code below is NOT tested against the live services (the build sandbox has no access to them); test it on your Vercel deployment.

## 0. How the pieces fit
| Layer | Service | Needs keys? |
|---|---|---|
| Market lists, prices, order books, price history | Polymarket public APIs | No |
| Email login + wallet creation | Privy | App ID (public) + App Secret (server only) |
| Placing real orders | Polymarket CLOB via `@polymarket/client` | Builder API key (server only) + user wallet signature |
| LOWCELL estimates, weather, copy-trade, leaderboard | **Your own backend** | n/a (Polymarket does not provide these) |

Environment variables: anything prefixed `VITE_` ships in the browser bundle. Put only public IDs there (`VITE_PRIVY_APP_ID`). Secrets (`PRIVY_APP_SECRET`, `POLYMARKET_BUILDER_*`) live in Vercel env vars and are used only by `/api` serverless functions.

## 1. Real market data and chart data (no keys, do this first)
Endpoints (all GET, public): Gamma `https://gamma-api.polymarket.com`, CLOB `https://clob.polymarket.com`, Data API `https://data-api.polymarket.com`.

- List markets: `/markets/keyset?closed=false&limit=20` (page with `after_cursor=<next_cursor>`), or `/events/keyset?...` for grouped events (e.g. all brackets of one question). Docs: market-data/discover-markets.
- Gotchas: in the raw REST responses `outcomes`, `outcomePrices` and `clobTokenIds` are JSON-encoded **strings**, so `JSON.parse` them. Polymarket Protocol V2 markets return `positionIds` instead of `clobTokenIds` and `version: "v2"`; the server default is CTF (v1) markets unless you pass `version=v2` (or both). Always pass `closed=false` for live markets.
- Chart: `GET https://data-api.polymarket.com/v2/prices-history?token_id=<id>&interval=1d&bucket_seconds=3600` -> `{ data:[{timestamp, price, resolution_seconds}], pagination }`, oldest first. Limits: explicit `start`/`end` spans max 15 days; `interval=max` defaults to 12-hour buckets; `bucket_seconds` is 60-86400 (min 300 for `1w`, 600 for `max`/`1m`). Points are not evenly spaced, so read `resolution_seconds`. Map your range tabs (1H/6H/1D/1W/1M/ALL) to `interval` values; check the SDK's `PriceHistoryInterval` for the exact names.
- Order book: `GET /book?token_id=<id>` -> `{bids,asks,tick_size,min_order_size,neg_risk,last_trade_price,hash}`. **Bids are ascending and asks descending, so the best price is the last entry of each.** Batch: `POST /books` (max 500).
- Prices: `/price?token_id=&side=BUY` (BUY = lowest ask), `/midpoint`, `/spread`, batch `POST /prices`.
- Live updates: the official SDK `client.subscribe([{topic:'market', assetIds:[...]}])`.
- Official SDK alternative: `npm i @polymarket/client`, `createPublicClient()`, then `listMarkets`, `fetchOrderBook`, `listPriceHistory`.
- CORS: I could not confirm browser CORS policy from the docs. Test from your deployed site; if a request is blocked, call it through your own `/api` route (which also gives you caching and shields you from rate limits).

Where to change the project: implement the `DataSource` interface (`src/data/types.ts`) in `src/data/adapter.ts` with `fetch` calls above and keep the return shapes. `src/pages/market.tsx` currently uses `m.history` for the chart; fetch `prices-history` for the selected outcome's asset ID when the page opens and when the range tab changes. The `Book` there is sample data: replace it with `/book`.

`lowcell` (our estimate) does not exist in Polymarket data. Until your model backend provides it, mark live markets `modeled:false` (the UI already handles that).

## 2. Privy: email login + automatic wallet
1. dashboard.privy.io -> create an app. Enable Email login. Add your Vercel domain and `http://localhost:5173` to allowed origins. Copy the **App ID**; keep the **App Secret** server-side.
2. `npm i @privy-io/react-auth` and set `VITE_PRIVY_APP_ID`.
3. Wrap the app (`src/main.tsx`):
```tsx
import {PrivyProvider} from '@privy-io/react-auth';
<PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{appearance:{theme:'dark'},embeddedWallets:{ethereum:{createOnLogin:'users-without-wallets'}}}}>
  <App/></PrivyProvider>
```
4. LOWCELL has its own login modal (white-label). Privy does **not** apply `createOnLogin` to white-label flows, so create the wallet yourself after login:
```tsx
const {sendCode, loginWithCode} = useLoginWithEmail();
const {user, createWallet} = usePrivy();
await sendCode({email});                 // step 1
await loginWithCode({code});             // step 2
if (!user?.wallet) await createWallet(); // users can have at most one embedded wallet
```
   (Or call Privy's own `login()` modal and delete `src/components/AuthModal.tsx`.)
5. Because these are hooks, turn `auth` in `src/integrations/providers.ts` into a `useAuth()` hook with the same shape, and call it from `AuthModal.tsx` and the store.
6. Connect X: use Privy's account-linking (e.g. `linkTwitter`) instead of the mock `linkX`.
7. On your server, verify the user's Privy access token before doing anything privileged (next section).

## 3. Real orders (only after steps 1-2 work, and after legal review)
Polymarket's current model (docs: trading/wallets-auth): the user's signer controls a **Deposit Wallet**; collateral is **pUSD**; orders go to the CLOB and settle on Polygon.
1. Create a polymarket.com account for LOWCELL -> Settings -> Builders -> create a **Builder API key** (key, secret, passphrase). Server only.
2. Add a server route that signs builder requests, **after verifying the caller's Privy token**:
```ts
// api/builder/sign.ts
import {buildHmacSignature} from '@polymarket/client';
export async function POST(request: Request) {
  // 1) verify the Privy access token from request.headers.get('authorization'), else return 401
  const {body, method, path} = await request.json();
  const timestamp = Math.floor(Date.now()/1000);
  return Response.json({
    POLY_BUILDER_API_KEY: process.env.POLYMARKET_BUILDER_API_KEY!,
    POLY_BUILDER_PASSPHRASE: process.env.POLYMARKET_BUILDER_PASSPHRASE!,
    POLY_BUILDER_SIGNATURE: await buildHmacSignature(process.env.POLYMARKET_BUILDER_SECRET!, timestamp, method, path, body),
    POLY_BUILDER_TIMESTAMP: `${timestamp}`});
}
```
3. In the browser, turn Privy's embedded wallet into a viem wallet client and hand it to the SDK:
```ts
import {createSecureClient, remoteBuilderSigning} from '@polymarket/client';
import {signerFrom} from '@polymarket/client/viem';
const provider = await embeddedWallet.getEthereumProvider(); // from useWallets(): walletClientType === 'privy'
const walletClient = createWalletClient({account: embeddedWallet.address, chain: polygon, transport: custom(provider)});
const client = await createSecureClient({
  signer: signerFrom(walletClient),
  apiKey: remoteBuilderSigning({url:'/api/builder/sign', headers:{Authorization:`Bearer ${await getAccessToken()}`}})});
await client.setupTradingApprovals(); // once per wallet (neg-risk markets need extra adapter approvals, see the docs)
```
   The SDK derives and deploys the user's Deposit Wallet automatically. The Privy/viem glue is the standard pattern but verify it against Privy's wallet docs.
4. Implement `trading.placeOrder()` (`src/integrations/providers.ts`) with the SDK's order methods (docs: trading/place-orders): market orders, limit orders, cancels.
5. Funding: users need pUSD in their Deposit Wallet. Use Polymarket's bridge (docs: trading/bridge/deposit). Replace the practice `wallet.deposit/withdraw`.
6. Replace local state: positions, orders, closed trades and history in `src/state/store.tsx` should come from Polymarket (docs: trading/wallet-activity and the Data API), not localStorage. Subscribe to the `user` stream for fills.
7. Builder fees and attribution: docs programs/builders.

## 4. Before real money (not optional)
- Prediction-market access is restricted in many jurisdictions and Polymarket applies its own eligibility rules and geoblocking. You are responsible for your own legal review, terms of service, privacy policy and any KYC/compliance duties. Get legal advice first. Keep the app in practice mode until that is done.
- Rate limits and outages: cache on the server, handle errors, show stale-data warnings.
- Security: no secrets in `VITE_` variables, verify Privy tokens on every privileged route, never log signatures.
- Test on Polygon with tiny amounts first.

## 5. Suggested order of work
1. Live read-only data (section 1). Safe, no accounts needed.
2. Privy login (section 2).
3. Your LOWCELL model backend for estimates/weather/leaderboard.
4. Trading (section 3), after legal review.

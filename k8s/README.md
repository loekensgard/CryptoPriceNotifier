# Kubernetes deployment

Plain manifests applied by hand with `kubectl` — no ArgoCD/GitOps.

The bot is a stateless Discord client: it opens an outbound WebSocket and
listens on **no port**, so there is no Service, Ingress, or health probe.

## Files

| File                  | What it is                                             |
| --------------------- | ------------------------------------------------------ |
| `namespace.yaml`      | The `crypto-price-notifier` namespace.                 |
| `deployment.yaml`     | The bot Deployment (1 replica).                        |
| `secret.example.yaml` | Template for the Discord-token secret. **Copy, don't apply directly.** |

The image is built and pushed to `ghcr.io/loekensgard/crypto-price-notifier`
by `.github/workflows/build-and-push.yaml` on every push to `main`
(tag `:main`) and on git tags (`:1.2.3`). The Deployment tracks `:main`.

## First-time deploy

Make sure you're pointed at the right cluster:

```sh
kubectl config current-context   # should be the target k8s cluster
```

### 1. Namespace

```sh
kubectl apply -f k8s/namespace.yaml
```

### 2. Image pull access

The GHCR package is **private by default**, so the cluster can't pull it
until you do one of:

**Option A — make the package public (simplest).**
GitHub → your profile → Packages → `crypto-price-notifier` → Package settings
→ Change visibility → Public. Then delete the `imagePullSecrets` block in
`deployment.yaml`.

**Option B — create a pull secret.** Use a GitHub PAT with `read:packages`:

```sh
kubectl create secret docker-registry ghcr-pull \
  --namespace crypto-price-notifier \
  --docker-server=ghcr.io \
  --docker-username=loekensgard \
  --docker-password=<GITHUB_PAT_WITH_read:packages>
```

(`deployment.yaml` already references `imagePullSecrets: ghcr-pull`.)

### 3. Discord tokens secret

```sh
cp k8s/secret.example.yaml k8s/secret.yaml
# edit k8s/secret.yaml — paste the real ETH + BTC Discord tokens
kubectl apply -f k8s/secret.yaml
```

`k8s/secret.yaml` is gitignored. Never commit real tokens.

### 4. Deploy the bot

```sh
kubectl apply -f k8s/deployment.yaml
```

### 5. Verify

```sh
kubectl -n crypto-price-notifier get pods
kubectl -n crypto-price-notifier logs -l app=crypto-price-notifier -f
```

## Updating

After a new image is pushed to `:main`, roll the pod:

```sh
kubectl -n crypto-price-notifier rollout restart deployment/crypto-price-notifier
```

## Changing tokens

Edit `k8s/secret.yaml`, re-apply, then `rollout restart` (env is read at
startup).

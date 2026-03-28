# 🚀 Kubernetes Helm Deployment with Ingress & SSL (cert-manager)

This project demonstrates a **production-style deployment** of a Node.js application on Kubernetes using:

* Helm (package manager)
* Ingress Controller (NGINX)
* SSL/TLS using cert-manager + Let's Encrypt
* Domain-based routing

---

# 🧠 Architecture Overview

```
User → Domain (demo.jssttechnologies.co.in)
        ↓
Ingress (NGINX Controller)
        ↓
Service (ClusterIP)
        ↓
Pod (Node.js App)
```

For HTTPS:

```
Ingress → cert-manager → Let's Encrypt → TLS Secret → HTTPS 🔒
```

---

# 🛠️ Tech Stack

* Kubernetes (k3s)
* Helm
* NGINX Ingress Controller
* cert-manager
* Let's Encrypt (SSL)
* AWS EC2

---

# 📦 Project Structure

```
.
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
```

---

# 🚀 Setup Guide

---

## 🔹 1. Setup Kubernetes (k3s)

```bash
curl -sfL https://get.k3s.io | sh -
```

```bash
kubectl get nodes
```

---

## 🔹 2. Install Helm

```bash
sudo snap install helm --classic
helm version
```

---

## 🔹 3. Install NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

---

## 🔹 4. Expose Ingress (NodePort)

```bash
kubectl edit svc ingress-nginx-controller -n ingress-nginx
```

Change:

```yaml
type: NodePort
```

---

## 🔹 5. Install cert-manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

---

## 🔹 6. Create ClusterIssuer

```bash
kubectl apply -f cluster-issuer.yaml
```

Example:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: your-email@gmail.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

---

## 🔹 7. Configure Helm values.yaml

```yaml
ingress:
  enabled: true
  className: nginx

  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"

  hosts:
    - host: demo.jssttechnologies.co.in
      paths:
        - path: /
          pathType: Prefix

  tls:
    - secretName: demo-app-tls
      hosts:
        - demo.jssttechnologies.co.in
```

---

## 🔹 8. Deploy Application

```bash
helm install demo-app .
```

For updates:

```bash
helm upgrade demo-app .
```

---

# 🔍 Verification

---

## Check Pods

```bash
kubectl get pods
```

---

## Check Service

```bash
kubectl get svc
```

---

## Check Ingress

```bash
kubectl get ingress
```

---

## Check SSL Certificate

```bash
kubectl get certificate
kubectl describe certificate demo-app-tls
```

---

# 🌐 Access Application

```
http://demo.jssttechnologies.co.in
https://demo.jssttechnologies.co.in 🔒
```

---

# ⚠️ Troubleshooting Guide

---

## ❌ Issue: Ingress not working

**Cause:** No Ingress Controller

**Fix:**

```bash
kubectl get pods -n ingress-nginx
```

---

## ❌ Issue: Domain not accessible

**Cause:** DNS not pointing to EC2

**Fix:**

```bash
ping demo.jssttechnologies.co.in
```

---

## ❌ Issue: SSL not generating

**Cause:**

* Port 80 blocked
* Ingress not reachable

**Fix:**

* Open port 80 in AWS Security Group
* Verify HTTP works first

---

## ❌ Issue: Certificate stuck in Pending

```bash
kubectl describe certificate
```

Check:

* Challenge errors
* DNS mismatch

---

## ❌ Issue: "Not Secure" in browser

**Cause:**

* HTTPS not enforced
* Port 443 not open

**Fix:**

```yaml
nginx.ingress.kubernetes.io/ssl-redirect: "true"
```

Open port 443 in AWS

---

# 🧠 Key Learnings

* Helm does NOT install Ingress Controller automatically
* Ingress = Rules, Controller = Traffic handler
* cert-manager automates SSL lifecycle
* Port 80 is required for Let's Encrypt validation
* Networking issues cause most SSL failures

---

# 🚀 Future Improvements

* Use AWS LoadBalancer instead of NodePort
* Add CI/CD pipeline (GitHub Actions / Jenkins)
* Implement monitoring (Prometheus + Grafana)
* Add auto-scaling (HPA)

---

# 👨‍💻 Author

**Tarun Kumar**
DevOps Engineer | AWS | Kubernetes | Helm

---


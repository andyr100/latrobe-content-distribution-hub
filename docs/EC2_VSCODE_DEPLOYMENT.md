# EC2 deployment and VS Code Remote SSH

This guide deploys the committed `main` branch with Docker Compose and leaves the EC2 host available for VS Code Remote SSH.

## Recommended assessment instance

Launch an Ubuntu 24.04 LTS instance with an Elastic IP, a 60 GiB gp3 EBS volume, and an `m7i.2xlarge` instance type (8 vCPU, 32 GiB RAM). Stop or terminate it after assessment work to avoid continued cost.

Create an ED25519 key pair and keep its private `.pem` file on the local computer only. Do not use an EC2 account password for SSH.

Use this security group:

| Port | Protocol | Source | Purpose |
| --- | --- | --- | --- |
| 22 | TCP | Your public IPv4 `/32` | SSH and VS Code Remote SSH |
| 80 | TCP | `0.0.0.0/0` | Frontend |
| 4080 | TCP | Assessment viewers that need the browser API | Public API used by the frontend |

The current assessment configuration maps frontend host port `80` to container port `3000` and API host port `4080` to container port `4000`. The RSS client and SQLite volume are private Docker services.

## Host preparation

SSH from PowerShell, replacing the hostname and private-key path:

```powershell
ssh -i "$env:USERPROFILE\.ssh\latrobe-ec2.pem" ubuntu@YOUR_EC2_PUBLIC_DNS
```

On the instance install Docker, Git and the Compose plugin using the current official Docker instructions for Ubuntu. Then clone the committed repository:

```bash
git clone https://github.com/andyr100/latrobe-content-distribution-hub.git
cd latrobe-content-distribution-hub
cp ec2.env.example ec2.env
nano ec2.env
```

Set only these values in `ec2.env`, using the Elastic IP or public DNS name without a trailing slash:

```dotenv
PUBLIC_FRONTEND_BASE_URL=http://YOUR_EC2_PUBLIC_DNS
PUBLIC_API_BASE_URL=http://YOUR_EC2_PUBLIC_DNS:4080
NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED=true
```

Deploy and verify:

```bash
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml up --build -d
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml ps
curl -f http://127.0.0.1:4000/health
```

From the local computer, verify `http://YOUR_EC2_PUBLIC_DNS` and `http://YOUR_EC2_PUBLIC_DNS:4080/health`.

## VS Code Remote SSH

Install the VS Code **Remote - SSH** extension locally. Add this entry to `C:\Users\reaan\.ssh\config`:

```text
Host latrobe-ec2
  HostName YOUR_EC2_PUBLIC_DNS
  User ubuntu
  IdentityFile C:\Users\reaan\.ssh\latrobe-ec2.pem
  IdentitiesOnly yes
```

In VS Code, run **Remote-SSH: Connect to Host...**, choose `latrobe-ec2`, then open `/home/ubuntu/latrobe-content-distribution-hub`. Use the integrated remote terminal for `git pull` and Docker Compose commands.

## Updating the deployment

After pushing a new commit from the local computer:

```bash
cd ~/latrobe-content-distribution-hub
git pull --ff-only origin main
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml up --build -d
```

Never run `docker compose down -v` unless intentionally deleting the persistent SQLite assessment data.

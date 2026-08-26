import paramiko
import time
import sys

def run_remote_command(ssh, command):
    """Run a command on the remote server and capture output."""
    print(f"\n>>> Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command, timeout=300)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out)
    if err:
        print(f"STDERR: {err}")
    print(f"<<< Exit code: {exit_status}")
    return exit_status, out, err

def main():
    host = "63.141.255.202"
    username = "root"
    password = "Zola123!"

    print(f"Connecting to {host} as {username}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(host, port=22, username=username, password=password, timeout=15)
        print("Connected successfully!")
    except Exception as e:
        print(f"FAILED to connect: {e}")
        sys.exit(1)

    try:
        # Step 1: Check current directory structure
        run_remote_command(ssh, "ls -la /root/")
        run_remote_command(ssh, "ls -la /root/HlumisaProperties 2>/dev/null || echo 'HlumisaProperties dir not found in /root/'")
        run_remote_command(ssh, "ls -la /home/ 2>/dev/null || true")

        # Step 2: Find the project directory
        exit_code, out, err = run_remote_command(ssh, "find / -maxdepth 3 -name 'deploy.sh' -path '*Hlumisa*' 2>/dev/null | head -5")
        project_dir = None
        for line in out.split('\n'):
            line = line.strip()
            if line and 'deploy.sh' in line:
                project_dir = line.replace('/deploy.sh', '')
                break

        if not project_dir:
            # Try common locations
            for candidate in ["/root/HlumisaProperties", "/home/HlumisaProperties", "/opt/HlumisaProperties", "/var/www/HlumisaProperties"]:
                exit_code, out, err = run_remote_command(ssh, f"ls -d {candidate} 2>/dev/null")
                if "No such" not in out and out.strip():
                    project_dir = candidate
                    break

        if not project_dir:
            print("ERROR: Could not find the HlumisaProperties project directory on the server!")
            print("Please check where the project is deployed.")
            sys.exit(1)

        print(f"\n=== Found project at: {project_dir} ===")

        # Step 3: Go to project directory and pull latest code
        run_remote_command(ssh, f"cd {project_dir} && git pull origin master")

        # Step 4: Check MySQL status
        run_remote_command(ssh, "mysqladmin ping -h 127.0.0.1 -P 3306 -u zola -p'Zola123!' --silent 2>&1 || echo 'MySQL ping failed'")
        run_remote_command(ssh, "service mysql status 2>&1 | head -5 || systemctl status mysql 2>&1 | head -5 || true")

        # Step 5: Rebuild and restart the API
        print("\n=== Rebuilding and restarting API... ===")
        run_remote_command(ssh, f"cd {project_dir} && sudo docker compose down")
        run_remote_command(ssh, f"cd {project_dir} && sudo docker compose up -d --build")

        # Step 6: Wait for API to respond
        print("\n=== Waiting for API to become available... ===")
        for i in range(30):
            time.sleep(3)
            exit_code, out, err = run_remote_command(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/ 2>/dev/null || echo 'not ready'")
            if "200" in out:
                print(f"API is UP! (attempt {i+1})")
                break
            if i >= 29:
                print("WARNING: API did not respond within 90 seconds.")
                run_remote_command(ssh, f"cd {project_dir} && sudo docker compose logs --tail 50")

        # Step 7: Check API root endpoint
        run_remote_command(ssh, "curl -s http://localhost:5000/ || echo 'API not reachable'")

        # Step 8: Check health endpoint
        run_remote_command(ssh, "curl -s http://localhost:5000/health || echo 'Health endpoint not available (may be old code)'")

        # Step 9: Check docker container status
        run_remote_command(ssh, "sudo docker ps")

        # Step 10: Check logs
        run_remote_command(ssh, f"cd {project_dir} && sudo docker compose logs --tail 20")

        print("\n=== DEPLOYMENT COMPLETE ===")
    except Exception as e:
        print(f"ERROR during deployment: {e}")
    finally:
        ssh.close()
        print("\nSSH connection closed.")

if __name__ == "__main__":
    main()
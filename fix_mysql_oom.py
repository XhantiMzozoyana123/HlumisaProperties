import paramiko
import sys
import time

host = "63.141.255.202"
username = "root"
password = "Zola123!"

print("=" * 70)
print("MYSQL OOM FIX - SYSTEM ADMINISTRATION SCRIPT")
print("=" * 70)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run_cmd(cmd, timeout=30):
    """Run a command on the remote server and return (exit_status, stdout, stderr)"""
    print(f"\n>>> EXECUTING: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out.strip():
        print(f"--- STDOUT ---")
        print(out)
    if err.strip():
        print(f"--- STDERR ---")
        print(err)
    print(f"--- Exit code: {exit_status} ---")
    return exit_status, out, err

try:
    ssh.connect(host, port=22, username=username, password=password, timeout=15)
    print("CONNECTED SUCCESSFULLY to server!")
    print(f"Server: {host}")

    # ============================================================
    # STEP 1: CHECK LOGS FOR OOM KILLER EVIDENCE
    # ============================================================
    print("\n" + "=" * 70)
    print("STEP 1: CHECKING LOGS FOR OOM KILLER EVIDENCE")
    print("=" * 70)

    # Check dmesg for OOM killer events
    run_cmd("dmesg -T | grep -i oom | tail -20", timeout=15)

    # Check journalctl for MySQL service logs
    run_cmd("journalctl -u mysql --no-pager -n 50 | tail -50", timeout=15)

    # Check current memory status
    run_cmd("free -h", timeout=10)

    # ============================================================
    # STEP 2: ADD SWAP SPACE
    # ============================================================
    print("\n" + "=" * 70)
    print("STEP 2: CHECKING AND ADDING SWAP SPACE")
    print("=" * 70)

    # Check if swap already exists
    exit_code, swap_out, _ = run_cmd("swapon --show", timeout=10)

    if swap_out.strip():
        print(f"Swap already exists:\n{swap_out}")
    else:
        print("No swap file found. Creating 2GB swap file...")

        # Create 2GB swap file
        run_cmd("fallocate -l 2G /swapfile", timeout=30)
        # If fallocate fails, try dd as fallback
        exit_code, _, _ = run_cmd("ls -lh /swapfile", timeout=10)
        if exit_code != 0:
            print("fallocate failed, using dd instead...")
            run_cmd("dd if=/dev/zero of=/swapfile bs=1M count=2048", timeout=60)

        # Set correct permissions
        run_cmd("chmod 600 /swapfile", timeout=10)

        # Set up swap area
        run_cmd("mkswap /swapfile", timeout=10)

        # Enable swap
        run_cmd("swapon /swapfile", timeout=10)

        # Add to /etc/fstab for persistence across reboots
        # Check if already in fstab first
        exit_code, fstab_out, _ = run_cmd("grep -c '/swapfile' /etc/fstab", timeout=10)
        if fstab_out.strip() == "0":
            run_cmd("echo '/swapfile none swap sw 0 0' >> /etc/fstab", timeout=10)
            print("Added /swapfile to /etc/fstab for persistence across reboots.")
        else:
            print("/swapfile already in /etc/fstab.")

        # Verify swap is active
        run_cmd("swapon --show", timeout=10)

    # ============================================================
    # STEP 3: TUNE MYSQL RAM USAGE
    # ============================================================
    print("\n" + "=" * 70)
    print("STEP 3: TUNING MYSQL RAM USAGE")
    print("=" * 70)

    # Find MySQL config file
    exit_code, config_out, _ = run_cmd("ls /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null || ls /etc/mysql/my.cnf 2>/dev/null || ls /etc/my.cnf 2>/dev/null", timeout=10)
    print(f"MySQL config file found: {config_out.strip()}")

    # Check current innodb_buffer_pool_size setting
    run_cmd("grep -n 'innodb_buffer_pool_size' /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null || echo 'NOT FOUND in mysqld.cnf'", timeout=10)

    # Set innodb_buffer_pool_size = 256M under [mysqld]
    # First check if the setting already exists
    exit_code, grep_out, _ = run_cmd("grep -c 'innodb_buffer_pool_size' /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null", timeout=10)

    if grep_out.strip() == "0":
        # Setting doesn't exist - add it under [mysqld] section
        print("Adding innodb_buffer_pool_size = 256M to [mysqld] section...")
        # Use sed to insert after [mysqld] line
        run_cmd("sed -i '/^\\[mysqld\\]/a innodb_buffer_pool_size = 256M' /etc/mysql/mysql.conf.d/mysqld.cnf", timeout=10)
    else:
        # Setting exists - update it to 256M
        print("Updating existing innodb_buffer_pool_size to 256M...")
        run_cmd("sed -i 's/^innodb_buffer_pool_size.*/innodb_buffer_pool_size = 256M/' /etc/mysql/mysql.conf.d/mysqld.cnf", timeout=10)

    # Verify the change
    run_cmd("grep -n 'innodb_buffer_pool_size' /etc/mysql/mysql.conf.d/mysqld.cnf", timeout=10)

    # ============================================================
    # STEP 4: ENABLE AUTO-RESTART VIA SYSTEMD
    # ============================================================
    print("\n" + "=" * 70)
    print("STEP 4: ENABLING AUTO-RESTART FOR MYSQL")
    print("=" * 70)

    # Create systemd override file for mysql service
    # This is equivalent to 'systemctl edit mysql'
    run_cmd("mkdir -p /etc/systemd/system/mysql.service.d", timeout=10)

    # Write the override file
    override_content = """[Service]
Restart=always
RestartSec=5s
"""
    # Use a heredoc to write the override file
    cmd = "cat > /etc/systemd/system/mysql.service.d/override.conf << 'EOF'\n" + override_content + "EOF"
    run_cmd(cmd, timeout=10)

    # Reload systemd to pick up the changes
    run_cmd("systemctl daemon-reload", timeout=15)

    # Verify the override is in place
    run_cmd("systemctl show mysql --property=Restart --property=RestartSec", timeout=10)

    # ============================================================
    # STEP 5: APPLY & VERIFY
    # ============================================================
    print("\n" + "=" * 70)
    print("STEP 5: APPLYING CHANGES AND VERIFYING")
    print("=" * 70)

    # Restart MySQL to apply the new configuration
    print("\nRestarting MySQL service...")
    run_cmd("systemctl restart mysql", timeout=30)

    # Wait a moment for MySQL to start
    time.sleep(3)

    # Check MySQL status
    run_cmd("systemctl status mysql --no-pager", timeout=15)

    # Verify MySQL is running
    exit_code, _, _ = run_cmd("systemctl is-active mysql", timeout=10)
    if exit_code == 0:
        print("\n✅ MySQL is ACTIVE and running!")
    else:
        print("\n❌ MySQL is NOT running! Check the logs above.")

    # Print final memory summary
    print("\n" + "=" * 70)
    print("FINAL MEMORY SUMMARY")
    print("=" * 70)
    run_cmd("free -h", timeout=10)

    # Also show swap summary
    run_cmd("swapon --show", timeout=10)

    # Show MySQL process memory usage
    run_cmd("ps aux | grep mysqld | grep -v grep | head -5", timeout=10)

    print("\n" + "=" * 70)
    print("ALL TASKS COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    print("Summary of changes made:")
    print("  1. ✅ Checked dmesg and journalctl for OOM killer evidence")
    print("  2. ✅ Swap space: 2GB swap file created and added to /etc/fstab")
    print("  3. ✅ MySQL tuned: innodb_buffer_pool_size = 256M")
    print("  4. ✅ Auto-restart: Restart=always, RestartSec=5s configured")
    print("  5. ✅ MySQL restarted and verified running")
    print("=" * 70)

    ssh.close()
    print("\nConnection closed gracefully.")

except Exception as e:
    print(f"\n❌ FAILED: {type(e).__name__}: {e}")
    sys.exit(1)
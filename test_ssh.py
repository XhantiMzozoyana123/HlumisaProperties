import paramiko
import sys

host = "63.141.255.202"
username = "root"
password = "Zola123!"

print(f"Testing SSH connection to {host}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, port=22, username=username, password=password, timeout=15)
    print("CONNECTED SUCCESSFULLY!")
    
    stdin, stdout, stderr = ssh.exec_command("echo 'Connected to server'; hostname; pwd", timeout=10)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(f"Command output: {out}")
    if err:
        print(f"STDERR: {err}")
    print(f"Exit code: {exit_status}")
    
    ssh.close()
    print("Connection closed gracefully.")
except Exception as e:
    print(f"FAILED TO CONNECT: {type(e).__name__}: {e}")
    sys.exit(1)
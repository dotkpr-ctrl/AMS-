const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ZIP_NAME = 'ams_app.zip';
// Look for zip globally (internal) or locally (external)
let ZIP_SOURCE = path.join(__dirname, ZIP_NAME);
if (!fs.existsSync(ZIP_SOURCE)) {
    ZIP_SOURCE = path.join(process.cwd(), ZIP_NAME);
}

const TEMP_DIR = path.join(os.tmpdir(), 'ams_installer_' + Date.now());

console.log("=========================================");
console.log("   Academic Management System Setup   ");
console.log("=========================================");

if (!fs.existsSync(ZIP_SOURCE)) {
    console.error(`\n[!] ERROR: ${ZIP_NAME} not found.`);
    console.log(`Please ensure ${ZIP_NAME} is in the same folder as this installer.`);
    execSync('pause', { shell: true, stdio: 'inherit' });
    process.exit(1);
}

try {
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    console.log("Preparing installation...");
    const zipPath = path.join(TEMP_DIR, ZIP_NAME);

    // Copy the zip to temp (handles internal vs external)
    const zipData = fs.readFileSync(ZIP_SOURCE);
    fs.writeFileSync(zipPath, zipData);

    const installDir = path.join(process.env.LOCALAPPDATA, 'AMS-Management-System');
    console.log(`Installing to: ${installDir}`);
    if (!fs.existsSync(installDir)) fs.mkdirSync(installDir, { recursive: true });

    console.log("Extracting (this may take a minute)...");
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${installDir}' -Force"`);

    console.log("Creating shortcuts...");
    const appPath = path.join(installDir, 'AMS-Server.exe');
    const escapedAppPath = appPath.replace(/'/g, "''");
    const escapedInstallDir = installDir.replace(/'/g, "''");

    const psScript = `
        $WshShell = New-Object -ComObject WScript.Shell
        $DesktopPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'AMS Server.lnk')
        $Shortcut = $WshShell.CreateShortcut($DesktopPath)
        $Shortcut.TargetPath = '${escapedAppPath}'
        $Shortcut.WorkingDirectory = '${escapedInstallDir}'
        $Shortcut.Save()
        
        $StartPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('StartMenu'), 'Programs', 'AMS Server.lnk')
        $Shortcut = $WshShell.CreateShortcut($StartPath)
        $Shortcut.TargetPath = '${escapedAppPath}'
        $Shortcut.WorkingDirectory = '${escapedInstallDir}'
        $Shortcut.Save()
    `;

    const psPath = path.join(TEMP_DIR, 'shortcuts.ps1');
    fs.writeFileSync(psPath, psScript);
    execSync(`powershell -ExecutionPolicy Bypass -File "${psPath}"`);

    console.log("=========================================");
    console.log("   INSTALLATION COMPLETE!   ");
    console.log("=========================================");
    console.log("\nShortcuts created on Desktop and Start Menu.");
    console.log("The server is now running in the background.");

    execSync(`start "" "${appPath}"`, { shell: true });

    console.log("\nYou can now close this window.");
    setTimeout(() => {
        try { fs.rmSync(TEMP_DIR, { recursive: true, force: true }); } catch (e) { }
    }, 5000);

} catch (e) {
    console.error("\n[!] Installation Failed");
    console.error("Error Detail:", e.message);
    execSync('pause', { shell: true, stdio: 'inherit' });
    process.exit(1);
}

# 🚀 Torrent Maker Pro (Unraid WebUI)

A lightning-fast, lightweight WebUI to locally generate `.torrent` files directly from your Unraid server disks. Built with Node.js and Alpine Linux, this Docker container bypasses slow upload times by scanning your server files natively.

## ✨ Features
* **Native Server Browser:** Browse your Unraid `/data` share directly within the app. No drag-and-drop or network uploading required!
* **Blazing Fast:** Generates `.torrent` files in seconds and saves them automatically to your `/storage` directory.
* **Turbo Mode:** Automatically processes up to 5 torrents simultaneously for large queue batches.
* **Tracker Management:** Automatically fetches the latest public trackers, or lets you easily paste your own custom lists.
* **Ultra Lightweight:** Based on Alpine Linux for a tiny container footprint.

## 📡 Trackers & Feedback
By default, this application automatically fetches the `trackers_all.txt` list from the [ngosang/trackerslist](https://github.com/ngosang/trackerslist) repository. 

**Do you know a better tracker list?** 
If you know of a better, more reliable tracker list that is automatically updated, please contact me! You can reach out by creating an Issue on this GitHub repository or by using the built-in Contact button inside the WebUI. I am always looking to improve the app!

## 📦 Unraid Installation
1. Go to the **Apps** tab (Community Applications) in Unraid.
2. Search for **Torrent Maker Pro**.
3. Click Install. 
4. **Important:** By default, this app uses port `8080`. If port `8080` is already in use on your server, please change the 'WebUI Port' (Host Port) during installation to another free port (e.g., `8081` or `8282`).

☕ Support & Buy Me a Coffee
This project is developed with passion in my free time. If you enjoy using Torrent Maker Pro and want to help keep the app running, updated, and bug-free, please consider buying me a coffee!

👉 Buy me a coffee via PayPal (PandaBoyNL)

Thank you for your support! ❤️

## 🛠️ Manual Docker Installation
If you prefer to run it via CLI:
```bash
docker run -d \
  --name torrent-maker-pro \
  -p 8080:8080 \
  -v /mnt/user/downloads:/data \
  -v /mnt/user/torrents:/storage \
  pandaboynl/torrent-maker-pro:latest

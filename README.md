# 🔒 Image Metadata Editor

A privacy-first, client-side EXIF metadata editor for JPEG images. All processing happens in your browser — no server uploads, no tracking, no data collection.

## Features

- **View EXIF Data**: See all metadata embedded in your photos
- **Edit Metadata**: Modify camera info, timestamps, GPS location, copyright, and more
- **Strip Metadata**: Remove all EXIF data for privacy before sharing online
- **100% Client-Side**: Your images never leave your device
- **Educational**: Learn what metadata your camera embeds in photos

## Privacy Guarantee

This tool runs entirely in your browser using JavaScript. No images are uploaded to any server. No analytics. No tracking. Open source and verifiable.

## Technologies

- Pure JavaScript (no frameworks)
- [piexifjs](https://github.com/hMatoba/piexifjs) for EXIF manipulation
- Deployed on GitHub Pages
- Cloudflare DNS with proxy

## Use Cases

- Remove GPS location before sharing photos publicly
- Strip identifying metadata from images
- Update copyright information in bulk
- Learn what data your camera embeds
- Preserve privacy when sharing photos online

## Local Development

```bash
# Clone the repo
git clone https://github.com/Aero-VI/metadata-editor.git
cd metadata-editor

# Open in browser
open index.html
# or
python3 -m http.server 8000
```

## License

MIT License - do whatever you want with this code.

## Credits

Built with 🔥 by [Aero-VI](https://github.com/Aero-VI)

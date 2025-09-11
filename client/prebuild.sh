#!/bin/bash

# Ensure public directory exists
mkdir -p public

# Check if index.html exists, create if not
if [ ! -f public/index.html ]; then
  echo "Creating index.html..."
  cat > public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="DT TENDERS - Tender Management Application"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.svg" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>DT TENDERS</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOL
fi

# Check if manifest.json exists, create if not
if [ ! -f public/manifest.json ]; then
  echo "Creating manifest.json..."
  cat > public/manifest.json << 'EOL'
{
  "short_name": "DT TENDERS",
  "name": "DT TENDERS - Tender Management Application",
  "icons": [
    {
      "src": "favicon.svg",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/svg+xml"
    },
    {
      "src": "logo192.svg",
      "type": "image/svg+xml",
      "sizes": "192x192"
    },
    {
      "src": "logo512.svg",
      "type": "image/svg+xml",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOL
fi

echo "Public directory setup complete"

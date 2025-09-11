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

# Ensure src/pages directory exists
mkdir -p src/pages

# Create ProjectForm.css if it doesn't exist (as a fallback)
if [ ! -f src/pages/ProjectForm.css ]; then
  echo "Creating ProjectForm.css..."
  cat > src/pages/ProjectForm.css << 'EOL'
/* Fallback CSS for ProjectForm component */
.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.section-title {
  color: #4b6cb7;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #4b6cb7;
}

.form-control:focus, .form-select:focus {
  box-shadow: 0 0 0 0.2rem rgba(75, 108, 183, 0.25);
  border-color: #4b6cb7;
}
EOL
fi

# Create ProjectView.css if it doesn't exist (as a fallback)
if [ ! -f src/pages/ProjectView.css ]; then
  echo "Creating ProjectView.css..."
  cat > src/pages/ProjectView.css << 'EOL'
/* Fallback CSS for ProjectView component */
.project-view-container {
  margin-bottom: 2rem;
}

.project-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #4b6cb7;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4b6cb7;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.action-buttons {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
}
EOL
fi

echo "Public directory setup complete"

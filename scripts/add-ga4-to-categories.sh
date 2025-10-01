#!/bin/bash

# Add GA4 tracking to category pages

CATEGORY_FILES=(
    "/home/darius/Documents/myaibuffet/categories/tools-articles.html"
    "/home/darius/Documents/myaibuffet/categories/tutorials.html"
    "/home/darius/Documents/myaibuffet/categories/business.html"
    "/home/darius/Documents/myaibuffet/categories/research.html"
    "/home/darius/Documents/myaibuffet/categories/insights.html"
)

GA4_SNIPPET='    <!-- Google Analytics -->\n    <script async src="https://www.googletagmanager.com/gtag/js?id=G-W16M076SX3"></script>\n    <script>\n        window.dataLayer = window.dataLayer || [];\n        function gtag(){dataLayer.push(arguments);}\n        gtag('\''js'\'', new Date());\n        gtag('\''config'\'', '\''G-W16M076SX3'\'');\n    </script>\n'

for file in "${CATEGORY_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Check if GA4 is already present
        if grep -q "gtag" "$file"; then
            echo "✓ GA4 already in $(basename $file)"
        else
            # Insert GA4 snippet after the <link rel="icon"> line
            sed -i '/<link rel="icon"/a\
\
    <!-- Google Analytics -->\
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-W16M076SX3"></script>\
    <script>\
        window.dataLayer = window.dataLayer || [];\
        function gtag(){dataLayer.push(arguments);}\
        gtag('\''js'\'', new Date());\
        gtag('\''config'\'', '\''G-W16M076SX3'\'');\
    </script>' "$file"

            echo "✅ Added GA4 to $(basename $file)"
        fi
    else
        echo "❌ File not found: $(basename $file)"
    fi
done

echo ""
echo "Done! GA4 tracking added to category pages."

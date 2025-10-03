#!/bin/bash

# Script to add GA4 and Clarity to all category pages

ANALYTICS='
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-W16M076SX3"><\/script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('\''js'\'', new Date());
        gtag('\''config'\'', '\''G-W16M076SX3'\'');
    <\/script>

    <!-- Microsoft Clarity -->
    <script type="text\/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https:\/\/www.clarity.ms\/tag\/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "tkfgls2nk8");
    <\/script>
<\/head>'

for file in categories/*.html; do
    if ! grep -q "tkfgls2nk8" "$file"; then
        echo "Adding analytics to $file..."
        sed -i "s/<\/head>/$ANALYTICS/" "$file"
        echo "✓ Done: $file"
    else
        echo "⊘ Skipped (already has analytics): $file"
    fi
done

echo ""
echo "✅ Analytics added to all category pages!"

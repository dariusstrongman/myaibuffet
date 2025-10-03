#!/bin/bash

# Add Microsoft Clarity to all pages

CLARITY_SCRIPT='    <!-- Microsoft Clarity -->
    <script type="text\/javascript">
        (function(c,l,a,r,i,t,y){
            c\[a\]=c\[a\]||function(){(c\[a\].q=c\[a\].q||\[\]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https:\/\/www.clarity.ms\/tag\/"+i;
            y=l.getElementsByTagName(r)\[0\];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "p5y8qh9w8m");
    <\/script>'

# Add to all pages
for file in pages/*.html; do
    if ! grep -q "clarity.ms" "$file"; then
        echo "Adding Clarity to $file"
        # Add before </head>
        sed -i "s/<\/head>/$CLARITY_SCRIPT\n<\/head>/" "$file"
    else
        echo "Clarity already in $file - skipping"
    fi
done

echo "✅ Microsoft Clarity added to all pages!"

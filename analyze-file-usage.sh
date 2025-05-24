#!/bin/bash

echo "🔍 Zippify 2 - Dosya Kullanım Analizi"
echo "======================================"

# 1. Önemli dosyaları kontrol et
echo ""
echo "📋 1. Şüpheli dosyaların import durumu:"

suspicious_files=(
    "src/components/ActivityItem.tsx"
    "src/components/AppSidebar.tsx"
    "src/components/Header.tsx"
    "src/components/StatCard.tsx"
)

for file in "${suspicious_files[@]}"; do
    echo ""
    echo "🔍 Checking: $file"
    if [ -e "$file" ]; then
        # Bu dosyayı kim import ediyor?
        echo "   📥 Imported by:"
        grep -r "import.*$(basename $file .tsx)" src/ --include="*.tsx" --include="*.ts" --include="*.js" || echo "   ❌ No imports found"
        
        # Bu dosya neleri import ediyor?
        echo "   📤 Imports:"
        grep "^import" "$file" | head -3 || echo "   ❌ No imports in file"
    else
        echo "   ❌ File not found"
    fi
done

echo ""
echo "📋 2. Feature klasörlerinin kullanımı:"

feature_dirs=(
    "src/features/imageEditing"
    "src/features/landing"
)

for dir in "${feature_dirs[@]}"; do
    echo ""
    echo "🔍 Checking: $dir"
    if [ -d "$dir" ]; then
        echo "   📁 Files in directory:"
        find "$dir" -name "*.tsx" -o -name "*.ts" -o -name "*.js" | head -5
        
        echo "   📥 Used by:"
        find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs grep -l "$(basename $dir)" | head -3 || echo "   ❌ No usage found"
    else
        echo "   ❌ Directory not found"
    fi
done

echo ""
echo "📋 3. Service dosyalarının kullanımı:"

service_files=(
    "src/services/auth/authService.js"
    "src/services/deepseek/deepSeekService.js" 
    "src/services/profile/profileService.js"
    "src/services/utils/retryLogic.js"
)

for file in "${service_files[@]}"; do
    echo ""
    echo "🔍 Checking: $file"
    if [ -e "$file" ]; then
        echo "   📥 Used by:"
        grep -r "$(basename $file .js)" src/ --include="*.tsx" --include="*.ts" --include="*.js" | head -3 || echo "   ❌ No usage found"
    else
        echo "   ❌ File not found"
    fi
done

echo ""
echo "📋 4. UI Component kullanımı analizi:"

ui_components=(
    "accordion" "alert-dialog" "calendar" "chart" "command"
    "context-menu" "dialog" "drawer" "hover-card" "menubar"
)

echo "   🔍 Kullanılan UI Components:"
for comp in "${ui_components[@]}"; do
    usage=$(grep -r "import.*$comp" src/ --include="*.tsx" --include="*.ts" | wc -l)
    if [ $usage -gt 0 ]; then
        echo "   ✅ $comp: $usage kullanım"
    else
        echo "   ❌ $comp: 0 kullanım"
    fi
done

echo ""
echo "📋 5. Proje boyut analizi:"
echo "   📊 Toplam boyut:"
du -sh .
echo "   📊 node_modules boyutu:"
du -sh node_modules
echo "   📊 src/ boyutu:"
du -sh src
echo "   📊 Backend boyutu:"
du -sh backend

echo ""
echo "✅ Analiz tamamlandı!"
echo ""
echo "🎯 Öneriler:"
echo "   1. ❌ işaretli dosyaları güvenle silebilirsin"
echo "   2. UI componentleri gelecekte lazım olabilir (kalsın)" 
echo "   3. node_modules yeniden kurulum gerekebilir"
echo "   4. Build test et: npm run build" 
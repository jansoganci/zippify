#!/bin/bash

echo "🧹 Zippify 2 - Kullanılmayan Dosya Temizliği"
echo "=============================================="

# Güvenlik için backup oluştur
echo "📦 Backup oluşturuluyor..."
timestamp=$(date +"%Y%m%d_%H%M%S")
mkdir -p "backups/cleanup_$timestamp"

# 1. FRONTEND: Kullanılmayan NPM paketlerini kaldır
echo ""
echo "🗑️  1. Frontend: Kullanılmayan NPM paketleri kaldırılıyor..."
npm uninstall @google/generative-ai jspdf marked multer node-fetch sqlite sqlite3

# 2. BACKEND: Kullanılmayan NPM paketlerini kaldır  
echo ""
echo "🗑️  2. Backend: Kullanılmayan NPM paketleri kaldırılıyor..."
cd backend
npm uninstall lodash multer
cd ..

# 3. Kullanılmayan dosyaları güvenli şekilde sil
echo ""
echo "🗑️  3. Kullanılmayan dosyalar kaldırılıyor..."

# Önce backup'a kopyala
files_to_remove=(
    "src/components/ActivityItem.tsx"
    "src/components/AppSidebar.tsx" 
    "src/components/Header.tsx"
    "src/components/StatCard.tsx"
    "src/features/imageEditing"
    "src/features/landing"
    "src/services/auth/authService.js"
    "src/services/deepseek/deepSeekService.js"
    "src/services/profile/profileService.js"
    "src/services/utils/retryLogic.js"
    "src/services/workflow"
    "src/platformRules"
)

for file in "${files_to_remove[@]}"; do
    if [ -e "$file" ]; then
        echo "📋 Backing up: $file"
        cp -r "$file" "backups/cleanup_$timestamp/"
        
        echo "🗑️  Removing: $file"
        rm -rf "$file"
    else
        echo "⚠️  Not found: $file"
    fi
done

# 4. Kullanılmayan UI componentleri (dikkatli)
echo ""
echo "🤔 UI Components (Manuel kontrol önerilir):"
ui_components=(
    "src/components/ui/accordion.tsx"
    "src/components/ui/alert-dialog.tsx"
    "src/components/ui/aspect-ratio.tsx"
    "src/components/ui/calendar.tsx"
    "src/components/ui/chart.tsx"
    "src/components/ui/command.tsx"
    "src/components/ui/context-menu.tsx"
    "src/components/ui/dialog.tsx"
    "src/components/ui/drawer.tsx"
    "src/components/ui/hover-card.tsx"
    "src/components/ui/input-otp.tsx"
    "src/components/ui/menubar.tsx"
    "src/components/ui/navigation-menu.tsx"
    "src/components/ui/resizable.tsx"
    "src/components/ui/slider.tsx"
    "src/components/ui/switch.tsx"
)

for component in "${ui_components[@]}"; do
    if [ -e "$component" ]; then
        echo "📋 Found UI component: $component (kept for now)"
    fi
done

echo ""
echo "✅ Temizlik tamamlandı!"
echo "📦 Backup konumu: backups/cleanup_$timestamp"
echo ""
echo "🔍 Kontrol edilmesi gerekenler:"
echo "   - UI componentleri manuel kontrol et"
echo "   - npm run build çalıştır"
echo "   - Uygulamayı test et"
echo ""
echo "💾 Boyut kazancı kontrol için:"
echo "   - Du -sh . (önce ve sonra)"
echo "   - npm ls --depth=0 (dependency listesi)" 
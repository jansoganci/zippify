/**
 * Markdown formatındaki örgü desenini yapılandırılmış JSON nesnesine dönüştürür
 * @param {string} markdown - Markdown formatındaki örgü deseni
 * @returns {Object} - Yapılandırılmış JSON nesnesi
 */
export const markdownToJson = (markdown) => {
  console.log('📝 [markdownToJson] Başlıyor...');
  console.log('📝 [markdownToJson] Markdown uzunluğu:', markdown?.length || 0, 'karakter');
  
  if (!markdown) {
    console.error('❌ [markdownToJson] Markdown içeriği boş!');
    return null;
  }

  // İlk 100 karakteri göster
  console.log('📝 [markdownToJson] Markdown örneği (ilk 100 karakter):', markdown.substring(0, 100) + '...');

  // Sonuç nesnesi
  const result = {
    title: '',
    summary: '',
    materials: [],
    skillLevel: '',
    instructions: [],
    notes: [],
    assembly: []
  };

  try {
    // Markdown'ı satırlara böl
    const lines = markdown.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`📝 [markdownToJson] ${lines.length} satır bulundu`);
    
    // Geçerli bölümü izle
    let currentSection = '';
    let sectionCounts = {
      title: 0,
      materials: 0,
      skillLevel: 0,
      instructions: 0,
      notes: 0,
      assembly: 0,
      ignore: 0,
      unknown: 0
    };
    
    // Her satırı işle
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Başlık satırı mı kontrol et
      if (line.startsWith('## ')) {
        const sectionTitle = line.substring(3).toLowerCase();
        console.log(`📝 [markdownToJson] Bölüm başlığı bulundu: "${sectionTitle}"`);
        
        if (sectionTitle.includes('title') || sectionTitle.includes('overview')) {
          currentSection = 'title';
          console.log('📝 [markdownToJson] Başlık bölümü işleniyor...');
        } else if (sectionTitle.includes('material') || sectionTitle.includes('tool')) {
          currentSection = 'materials';
          console.log('📝 [markdownToJson] Malzemeler bölümü işleniyor...');
        } else if (sectionTitle.includes('skill') || sectionTitle.includes('level')) {
          currentSection = 'skillLevel';
          console.log('📝 [markdownToJson] Beceri seviyesi bölümü işleniyor...');
        } else if (sectionTitle.includes('pattern') || sectionTitle.includes('instruction')) {
          currentSection = 'instructions';
          console.log('📝 [markdownToJson] Talimatlar bölümü işleniyor...');
        } else if (sectionTitle.includes('sleeve')) {
          currentSection = 'instructions'; // Sleeves de instructions'a dahil
          console.log('📝 [markdownToJson] Kollar bölümü işleniyor (talimatlar olarak)...');
        } else if (sectionTitle.includes('note') || sectionTitle.includes('tip')) {
          currentSection = 'notes';
          console.log('📝 [markdownToJson] Notlar bölümü işleniyor...');
        } else if (sectionTitle.includes('assembly') || sectionTitle.includes('finishing')) {
          currentSection = 'assembly';
          console.log('📝 [markdownToJson] Montaj bölümü işleniyor...');
        } else if (sectionTitle.includes('abbreviation') || sectionTitle.includes('copyright')) {
          currentSection = 'ignore'; // Bu bölümleri atla
          console.log('📝 [markdownToJson] Kısaltmalar veya telif hakkı bölümü atlanıyor...');
        } else {
          currentSection = ''; // Tanımlanmamış bölüm
          console.log(`⚠️ [markdownToJson] Tanımlanmamış bölüm: "${sectionTitle}"`);
          sectionCounts.unknown++;
        }
        
        continue; // Başlık satırını işleme dahil etme
      }
      
      // Geçerli bölüme göre satırı işle
      if (currentSection === 'title') {
        if (!result.title) {
          result.title = line.replace(/^#+ /, '').trim();
          console.log(`📝 [markdownToJson] Başlık ayarlandı: "${result.title}"`);
        } else {
          result.summary += line + ' ';
          sectionCounts.title++;
        }
      } else if (currentSection === 'materials') {
        // Madde işaretlerini temizle
        const material = line.replace(/^[*\-•] /, '').trim();
        result.materials.push(material);
        sectionCounts.materials++;
      } else if (currentSection === 'skillLevel') {
        if (line.toLowerCase().includes('skill level')) {
          const match = line.match(/skill level:?\s*([a-zA-Z]+)/i);
          if (match && match[1]) {
            result.skillLevel = match[1].trim();
            console.log(`📝 [markdownToJson] Beceri seviyesi ayarlandı: "${result.skillLevel}"`);
          }
        }
        sectionCounts.skillLevel++;
      } else if (currentSection === 'instructions') {
        // Madde işaretlerini temizle
        const instruction = line.replace(/^[*\-•] /, '').trim();
        result.instructions.push(instruction);
        sectionCounts.instructions++;
      } else if (currentSection === 'notes') {
        // Madde işaretlerini temizle
        const note = line.replace(/^[*\-•] /, '').trim();
        result.notes.push(note);
        sectionCounts.notes++;
      } else if (currentSection === 'assembly') {
        // Madde işaretlerini temizle
        const step = line.replace(/^[*\-•] /, '').trim();
        result.assembly.push(step);
        sectionCounts.assembly++;
      } else if (currentSection === 'ignore') {
        sectionCounts.ignore++;
      } else {
        sectionCounts.unknown++;
      }
    }
    
    // Özeti temizle
    result.summary = result.summary.trim();
    
    // Bölüm istatistiklerini göster
    console.log('📊 [markdownToJson] Bölüm istatistikleri:');
    console.log(`   - Başlık/Özet: ${sectionCounts.title} satır`);
    console.log(`   - Malzemeler: ${sectionCounts.materials} öğe`);
    console.log(`   - Beceri seviyesi: ${sectionCounts.skillLevel} satır`);
    console.log(`   - Talimatlar: ${sectionCounts.instructions} adım`);
    console.log(`   - Notlar: ${sectionCounts.notes} not`);
    console.log(`   - Montaj: ${sectionCounts.assembly} adım`);
    console.log(`   - Atlanan: ${sectionCounts.ignore} satır`);
    console.log(`   - Tanımlanmamış: ${sectionCounts.unknown} satır`);
    
    // Eksik bölümleri kontrol et
    if (!result.title) {
      console.warn('⚠️ [markdownToJson] Uyarı: Markdown içinde başlık bölümü bulunamadı!');
    }
    
    // Sonuç nesnesini göster (kısaltılmış)
    console.log('✅ [markdownToJson] JSON dönüşümü tamamlandı:');
    console.log('   - Başlık:', result.title);
    console.log('   - Özet:', result.summary ? result.summary.substring(0, 50) + '...' : 'Yok');
    console.log('   - Malzeme sayısı:', result.materials.length);
    console.log('   - Beceri seviyesi:', result.skillLevel || 'Belirtilmemiş');
    console.log('   - Talimat sayısı:', result.instructions.length);
    console.log('   - Not sayısı:', result.notes.length);
    console.log('   - Montaj adımı sayısı:', result.assembly.length);
    
    return result;
  } catch (error) {
    console.error('❌ [markdownToJson] Markdown parse hatası:', error);
    console.error('❌ [markdownToJson] Hata detayı:', error.message);
    console.error('❌ [markdownToJson] Hata stack:', error.stack);
    return null;
  }
};
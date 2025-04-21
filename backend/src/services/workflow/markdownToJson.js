/**
 * Converts a knitting pattern in Markdown format to a structured JSON object
 * @param {string} markdown - Knitting pattern in Markdown format
 * @returns {Object} - Structured JSON object
 */
export const markdownToJson = (markdown) => {
  console.log('📝 [markdownToJson] Starting...');
  console.log('📝 [markdownToJson] Markdown length:', markdown?.length || 0, 'characters');
  
  if (!markdown) {
    logger.error('❌ [markdownToJson] Markdown content is empty!');
    return null;
  }

  // Show the first 100 characters
  console.log('📝 [markdownToJson] Markdown sample (first 100 characters):', markdown.substring(0, 100) + '...');

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
    // Split markdown into lines
    const lines = markdown.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`📝 [markdownToJson] ${lines.length} lines found`);
    
    // Track the current section
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
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if it's a section header
      if (line.startsWith('## ')) {
        const sectionTitle = line.substring(3).toLowerCase();
        console.log(`📝 [markdownToJson] Section header found: "${sectionTitle}"`);
        
        if (sectionTitle.includes('title') || sectionTitle.includes('overview')) {
          currentSection = 'title';
          console.log('📝 [markdownToJson] Processing title section...');
        } else if (sectionTitle.includes('material') || sectionTitle.includes('tool')) {
          currentSection = 'materials';
          console.log('📝 [markdownToJson] Processing materials section...');
        } else if (sectionTitle.includes('skill') || sectionTitle.includes('level')) {
          currentSection = 'skillLevel';
          console.log('📝 [markdownToJson] Processing skill level section...');
        } else if (sectionTitle.includes('pattern') || sectionTitle.includes('instruction')) {
          currentSection = 'instructions';
          console.log('📝 [markdownToJson] Processing instructions section...');
        } else if (sectionTitle.includes('sleeve')) {
          currentSection = 'instructions'; // Sleeves are included as instructions
          console.log('📝 [markdownToJson] Processing sleeves section (as instructions)...');
        } else if (sectionTitle.includes('note') || sectionTitle.includes('tip')) {
          currentSection = 'notes';
          console.log('📝 [markdownToJson] Processing notes section...');
        } else if (sectionTitle.includes('assembly') || sectionTitle.includes('finishing')) {
          currentSection = 'assembly';
          console.log('📝 [markdownToJson] Processing assembly section...');
        } else if (sectionTitle.includes('abbreviation') || sectionTitle.includes('copyright')) {
          currentSection = 'ignore'; // Skip these sections
          console.log('📝 [markdownToJson] Skipping abbreviations or copyright section...');
        } else {
          currentSection = ''; // Undefined section
          console.log(`⚠️ [markdownToJson] Undefined section: "${sectionTitle}"`);
          sectionCounts.unknown++;
        }
        
        continue; // Do not process the header line
      }
      
      // Process the line based on the current section
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
            console.log(`📝 [markdownToJson] Skill level set: "${result.skillLevel}"`);
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
    
    // Clean up the summary
    result.summary = result.summary.trim();
    
    // Show section statistics
    console.log('📊 [markdownToJson] Section statistics:');
    console.log(`   - Title/Summary: ${sectionCounts.title} lines`);
    console.log(`   - Materials: ${sectionCounts.materials} items`);
    console.log(`   - Skill level: ${sectionCounts.skillLevel} lines`);
    console.log(`   - Instructions: ${sectionCounts.instructions} steps`);
    console.log(`   - Notes: ${sectionCounts.notes} notes`);
    console.log(`   - Assembly: ${sectionCounts.assembly} steps`);
    console.log(`   - Skipped: ${sectionCounts.ignore} lines`);
    console.log(`   - Undefined: ${sectionCounts.unknown} lines`);
    
    // Check for missing sections
    if (!result.title) {
      logger.warn('⚠️ [markdownToJson] Warning: No title section found in markdown!');
    }
    
    // Show result object (shortened)
    console.log('✅ [markdownToJson] JSON conversion completed:');
    console.log('   - Title:', result.title);
    console.log('   - Summary:', result.summary ? result.summary.substring(0, 50) + '...' : 'None');
    console.log('   - Material count:', result.materials.length);
    console.log('   - Skill level:', result.skillLevel || 'Not specified');
    console.log('   - Instruction count:', result.instructions.length);
    console.log('   - Note count:', result.notes.length);
    console.log('   - Assembly step count:', result.assembly.length);
    
    return result;
  } catch (error) {
    logger.error('❌ [markdownToJson] Markdown parse error:', error);
    logger.error('❌ [markdownToJson] Error details:', error.message);
    logger.error('❌ [markdownToJson] Error stack:', error.stack);
    return null;
  }
};
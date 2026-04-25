/**
 * Cosplay Planner — Google Apps Script Database API (Fixed & Optimized)
 * 
 * วิธี Deploy:
 * 1. ไปที่ Extensions → Apps Script
 * 2. วางโค้ดนี้ลงไป
 * 3. กด Deploy → New Deployment
 * 4. เลือกประเภทเป็น "Web App"
 * 5. ตั้งค่า "Execute as: Me" และ "Who has access: Anyone" (สำคัญมาก)
 * 6. กด Deploy และคัดลอก Web App URL มาใส่ใน api_fixed.js
 */

const SHEET_NAME = 'Projects';

/**
 * Get or create the data sheet with headers
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'ProjectID', 'Character', 'Series', 'Budget', 'Status',
      'Note', 'Items_JSON', 'Base64_Image', 'CreatedAt', 'UpdatedAt'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Build a JSON response (GAS will handle CORS automatically)
 */
function makeResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'list';
    const sheet = getSheet();
    
    if (action === 'get' && e.parameter.id) {
      return makeResponse(getProjectById(sheet, e.parameter.id));
    } 
    if (action === 'search') {
      return makeResponse(searchProjects(sheet, e.parameter.q || ''));
    }
    
    // Default: list all
    return makeResponse(listProjects(sheet));
  } catch (error) {
    return makeResponse({ success: false, error: error.message });
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return makeResponse({ success: false, error: 'No data received' });
    }
    
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'create';
    const data = body.data || {};
    const sheet = getSheet();
    
    switch (action) {
      case 'create':
        return makeResponse(createProject(sheet, data));
      case 'update':
        return makeResponse(updateProject(sheet, data));
      case 'delete':
        const idToDelete = typeof data === 'string' ? data : data.id;
        return makeResponse(deleteProject(sheet, idToDelete));
      default:
        return makeResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (error) {
    return makeResponse({ success: false, error: error.message });
  }
}

// ===========================
//  Database Operations
// ===========================

function listProjects(sheet) {
  const values = sheet.getDataRange().getValues();
  values.shift(); // Remove header row
  
  const projects = values.filter(row => row[0]).map(row => {
    let items = [];
    try {
      items = JSON.parse(row[6] || '[]');
    } catch (e) {
      console.log('Error parsing items for project ' + row[0]);
      items = [];
    }
    
    return {
      id: String(row[0]),
      charName: row[1] || '',
      seriesName: row[2] || '',
      budget: Number(row[3]) || 0,
      status: row[4] || 'planning',
      note: row[5] || '',
      items: items,
      base64Image: row[7] || '',
      hasImage: !!row[7],
      createdAt: row[8] || '',
      updatedAt: row[9] || ''
    };
  });
  
  // Sort by updatedAt descending
  projects.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  
  return { success: true, data: projects };
}

function getProjectById(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const row = values.find(r => String(r[0]) === String(id));
  if (!row) return { success: false, error: 'Not found' };
  
  let items = [];
  try {
    items = JSON.parse(row[6] || '[]');
  } catch (e) {
    items = [];
  }
  
  return {
    success: true,
    data: {
      id: String(row[0]),
      charName: row[1] || '',
      seriesName: row[2] || '',
      budget: Number(row[3]) || 0,
      status: row[4] || 'planning',
      note: row[5] || '',
      items: items,
      base64Image: row[7] || '',
      createdAt: row[8] || '',
      updatedAt: row[9] || ''
    }
  };
}

function searchProjects(sheet, query) {
  const all = listProjects(sheet).data;
  const q = query.toLowerCase();
  const filtered = all.filter(p => 
    p.charName.toLowerCase().includes(q) || 
    p.seriesName.toLowerCase().includes(q) || 
    p.note.toLowerCase().includes(q)
  );
  return { success: true, data: filtered };
}

function createProject(sheet, data) {
  const id = data.id || Utilities.getUuid();
  const now = new Date().toISOString();
  sheet.appendRow([
    id,
    data.charName || '',
    data.seriesName || '',
    data.budget || 0,
    data.status || 'planning',
    data.note || '',
    JSON.stringify(data.items || []),
    data.base64Image || '',
    now,
    now
  ]);
  return { success: true, id: id };
}

function updateProject(sheet, data) {
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(r => String(r[0]) === String(data.id));
  if (rowIndex === -1) return { success: false, error: 'Not found' };
  
  const now = new Date().toISOString();
  const rowNum = rowIndex + 1;
  
  // Update specific columns
  sheet.getRange(rowNum, 2).setValue(data.charName || '');
  sheet.getRange(rowNum, 3).setValue(data.seriesName || '');
  sheet.getRange(rowNum, 4).setValue(data.budget || 0);
  sheet.getRange(rowNum, 5).setValue(data.status || 'planning');
  sheet.getRange(rowNum, 6).setValue(data.note || '');
  sheet.getRange(rowNum, 7).setValue(JSON.stringify(data.items || []));
  if (data.base64Image) sheet.getRange(rowNum, 8).setValue(data.base64Image);
  sheet.getRange(rowNum, 10).setValue(now);
  
  return { success: true, id: data.id };
}

function deleteProject(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(r => String(r[0]) === String(id));
  if (rowIndex === -1) return { success: false, error: 'Not found' };
  
  sheet.deleteRow(rowIndex + 1);
  return { success: true };
}

/**
 * Cosplay Planner — Google Apps Script Database API
 * 
 * Deploy: Extensions → Apps Script → Deploy → New Deployment → Web App
 * Execute as: Me | Access: Anyone
 * 
 * Sheet Structure:
 * | ProjectID | Character | Series | Budget | Status | Note | Items_JSON | Base64_Image | CreatedAt | UpdatedAt |
 */

// ============ CONFIG ============
const SHEET_NAME = 'Projects';
const BASE64_MAX_LENGTH = 50000;

// ============ HELPERS ============

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
    // Freeze header row
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Build a JSON response with CORS headers
 */
function makeResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Find a row index by ProjectID (1-based, including header)
 * Returns -1 if not found
 */
function findRowByProjectId(sheet, projectId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(projectId)) {
      return i + 1; // 1-based row number
    }
  }
  return -1;
}

// ============ doGet ============

/**
 * GET endpoint
 * 
 * ?action=list           → Return basic project list (no Base64)
 * ?action=get&id=xxx     → Return full project data including Base64
 */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'list';
    const sheet = getSheet();

    if (action === 'get' && e.parameter.id) {
      return getProjectById(sheet, e.parameter.id);
    }

    // Default: list all (lightweight, no Base64)
    return listProjects(sheet);

  } catch (error) {
    return makeResponse({ success: false, error: error.message });
  }
}

/**
 * List all projects — lightweight (excludes Base64_Image)
 */
function listProjects(sheet) {
  const data = sheet.getDataRange().getValues();
  const projects = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Skip empty rows
    if (!row[0]) continue;

    let items = [];
    try { items = JSON.parse(row[6] || '[]'); } catch (e) { items = []; }

    projects.push({
      id: String(row[0]),
      charName: row[1] || '',
      seriesName: row[2] || '',
      budget: Number(row[3]) || 0,
      status: row[4] || 'planning',
      note: row[5] || '',
      items: items,
      hasImage: !!row[7],        // Boolean flag instead of full Base64
      createdAt: row[8] || '',
      updatedAt: row[9] || ''
    });
  }

  return makeResponse({ success: true, data: projects });
}

/**
 * Get a single project by ID — full data including Base64
 */
function getProjectById(sheet, projectId) {
  const rowIdx = findRowByProjectId(sheet, projectId);

  if (rowIdx === -1) {
    return makeResponse({ success: false, error: 'Project not found' });
  }

  const row = sheet.getRange(rowIdx, 1, 1, 10).getValues()[0];

  let items = [];
  try { items = JSON.parse(row[6] || '[]'); } catch (e) { items = []; }

  const project = {
    id: String(row[0]),
    charName: row[1] || '',
    seriesName: row[2] || '',
    budget: Number(row[3]) || 0,
    status: row[4] || 'planning',
    note: row[5] || '',
    items: items,
    base64Image: row[7] || null,  // Full Base64 in Round 2
    createdAt: row[8] || '',
    updatedAt: row[9] || ''
  };

  return makeResponse({ success: true, data: project });
}

// ============ doPost ============

/**
 * POST endpoint
 * 
 * Body JSON:
 * {
 *   "action": "create" | "update" | "delete",
 *   "data": { ... project fields ... }
 * }
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'create';
    const sheet = getSheet();

    switch (action) {
      case 'create':
        return createProject(sheet, body.data);
      case 'update':
        return updateProject(sheet, body.data);
      case 'delete':
        return deleteProject(sheet, body.data);
      default:
        return makeResponse({ success: false, error: 'Unknown action: ' + action });
    }

  } catch (error) {
    return makeResponse({ success: false, error: error.message });
  }
}

/**
 * Create a new project
 */
function createProject(sheet, data) {
  if (!data || !data.charName) {
    return makeResponse({ success: false, error: 'Character name is required' });
  }

  // Validate Base64 size
  if (data.base64Image && data.base64Image.length > BASE64_MAX_LENGTH) {
    return makeResponse({
      success: false,
      error: 'Image too large: ' + data.base64Image.length + ' characters. Maximum is ' + BASE64_MAX_LENGTH + ' characters. Please compress the image further.'
    });
  }

  const projectId = data.id || Utilities.getUuid();
  const now = new Date().toISOString();

  const itemsJson = JSON.stringify(data.items || []);

  sheet.appendRow([
    projectId,
    data.charName || '',
    data.seriesName || '',
    Number(data.budget) || 0,
    data.status || 'planning',
    data.note || '',
    itemsJson,
    data.base64Image || '',
    now,
    now
  ]);

  return makeResponse({
    success: true,
    message: 'Project created',
    id: projectId
  });
}

/**
 * Update an existing project
 */
function updateProject(sheet, data) {
  if (!data || !data.id) {
    return makeResponse({ success: false, error: 'Project ID is required for update' });
  }

  // Validate Base64 size
  if (data.base64Image && data.base64Image.length > BASE64_MAX_LENGTH) {
    return makeResponse({
      success: false,
      error: 'Image too large: ' + data.base64Image.length + ' characters. Maximum is ' + BASE64_MAX_LENGTH + ' characters.'
    });
  }

  const rowIdx = findRowByProjectId(sheet, data.id);
  if (rowIdx === -1) {
    return makeResponse({ success: false, error: 'Project not found: ' + data.id });
  }

  const now = new Date().toISOString();
  const existingRow = sheet.getRange(rowIdx, 1, 1, 10).getValues()[0];

  const itemsJson = JSON.stringify(data.items || []);

  const updatedRow = [
    data.id,
    data.charName || existingRow[1],
    data.seriesName || existingRow[2],
    Number(data.budget) || existingRow[3],
    data.status || existingRow[4],
    data.note !== undefined ? data.note : existingRow[5],
    itemsJson,
    data.base64Image !== undefined ? (data.base64Image || '') : existingRow[7],
    existingRow[8],  // Keep original createdAt
    now
  ];

  sheet.getRange(rowIdx, 1, 1, 10).setValues([updatedRow]);

  return makeResponse({
    success: true,
    message: 'Project updated',
    id: data.id
  });
}

/**
 * Delete a project
 */
function deleteProject(sheet, data) {
  if (!data || !data.id) {
    return makeResponse({ success: false, error: 'Project ID is required for delete' });
  }

  const rowIdx = findRowByProjectId(sheet, data.id);
  if (rowIdx === -1) {
    return makeResponse({ success: false, error: 'Project not found: ' + data.id });
  }

  sheet.deleteRow(rowIdx);

  return makeResponse({
    success: true,
    message: 'Project deleted',
    id: data.id
  });
}

// ============ UTILITY: Manual Setup ============

/**
 * Run this once to create the sheet with headers
 */
function setupSheet() {
  getSheet();
  SpreadsheetApp.getActiveSpreadsheet().toast('Sheet "Projects" is ready!', 'Setup Complete');
}

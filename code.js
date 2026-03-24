function doPost(e) {
  try {
    const raw = e.parameter.data || e.postData.contents || "{}";
    const body = typeof raw === "string" ? JSON.parse(raw) : raw;

    const action = body.action;

    const routes = {
      getApplicationsForAdmin,
      scheduleFacility,
      submitMBFHIForm,
      getAvailableDates,
      saveChatMessage,
      getAdminMessages,
      getUserChatMessages, // ✅ ADDED - for loading chat history
      getAssessorMessages, // ✅ ADDED - for assessor chat
      getUnreadMessageCount, // ✅ ADDED - for unread count
      isAdmin,
      getUserEmail,
      getUserRole, // ✅ ADDED
      getAssessors, // ✅ ADDED
      saveChecklist, // ✅ ADDED
      getAssignedFacilities, // ✅ ADDED
      getChecklistByFacility, // ✅ ADDED
      getAdminAnalytics,
      getUserApplicationStatus // ✅ ADDED - for chat routing
    };

    if (!routes[action]) {
      throw new Error("Unknown action: " + action);
    }

    const result = routes[action](body);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: err.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === "login") {
    const email = Session.getActiveUser().getEmail();

    return ContentService
      .createTextOutput(JSON.stringify({ email }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput("NBFSite API running")
    .setMimeType(ContentService.MimeType.TEXT);
}

// =============================
// 🔐 NEW ROLE FUNCTION
// =============================
function getUserRole(body) {
  const sheet = SpreadsheetApp
    .openById('1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks')
    .getSheetByName('Sheet4');

  const data = sheet.getDataRange().getValues();
  const email = body.email?.toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const rowEmail = (data[i][1] || "").toLowerCase();

    if (rowEmail === email) {
      const roles = (data[i][2] || "")
        .toLowerCase()
        .split(",")
        .map(r => r.trim());

      return {
        email,
        roles, // ✅ ARRAY
        name: data[i][0],
      };
    }
  }

  return { email, roles: ["user"] };
}

// =============================
// GET USER APPLICATION STATUS
// Returns assigned assessor for chat routing (with email)
// =============================
function getUserApplicationStatus(body) {
  const SHEET_ID = '1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks';
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  const userSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet4');
  
  const data = sheet.getDataRange().getValues();
  const users = userSheet.getDataRange().getValues();
  const email = body.email?.toLowerCase();

  // Helper to get email from name
  function getEmailFromName(assessorName) {
    if (!assessorName) return null;
    const found = users.find(u => (u[0] || "").toLowerCase() === assessorName.toLowerCase());
    return found ? found[1] : null; // Return email if found
  }

  // Find user's application(s)
  for (let i = 1; i < data.length; i++) {
    const rowEmail = (data[i][2] || "").toLowerCase();
    
    if (rowEmail === email) {
      const assessorName = data[i][13]; // Column N - Assigned Assessor (name)
      
      if (assessorName && assessorName.toString().trim()) {
        const assessorEmail = getEmailFromName(assessorName);
        return {
          email,
          assessor: assessorEmail || assessorName, // Return email if found, otherwise name
          facility: data[i][3] // Column D - Facility name
        };
      }
    }
  }

  // No application or no assessor assigned
  return { email, assessor: null, facility: null };
}

// =============================
// EXISTING FUNCTIONS (RESTORED)
// =============================

function getUserEmail(body) {
  return { email: body.email };
}

function getApplicationsForAdmin() {
  const SHEET_ID = '1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks';
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  const userSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet4');
  const checklistSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Sheet5");

  const checklistData = checklistSheet.getDataRange().getValues();
  const data = sheet.getDataRange().getValues();
  const users = userSheet.getDataRange().getValues();

  const tz = Session.getScriptTimeZone();

  function getName(email) {
    if (!email) return "-";
    const found = users.find(u => (u[1] || "").toLowerCase() === email.toLowerCase());
    return found ? found[0] : email;
  }

  const results = [];

  for (let i = 1; i < data.length; i++) {
    const r = data[i];

    // 🔥 CORRECT STATUS LOGIC
    let displayStatus = r[11] || "Pending"; // Use saved status from sheet

    // Check if final assessment result exists and update status
    const finalStatus = getAssessmentStatus(r[3]);
    if (finalStatus) {
      displayStatus = finalStatus; // Passed / Failed / Compliance
    }

    results.push({
      row: i + 1,
      facility: r[3],
      preferredDate: r[6]
        ? Utilities.formatDate(new Date(r[6]), tz, "MMM d, yyyy")
        : "",
      preferredTime: r[7]
        ? Utilities.formatDate(new Date(r[7]), tz, "hh:mm a")
        : "",
      scheduleDate: r[9]
        ? Utilities.formatDate(new Date(r[9]), tz, "yyyy-MM-dd") // 🔥 important for filter
        : "",
      scheduleTime: r[10]
        ? Utilities.formatDate(new Date(r[10]), tz, "hh:mm a")
        : "",
      status: displayStatus,
      assessor: getName(r[13]),
      type: r[14], // Column O - Type of Facility
    });
  }

  return results;
}

function getAssessmentStatus(facility) {
  const checklistData = SpreadsheetApp.openById("1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks")
    .getSheetByName("Sheet5")
    .getDataRange()
    .getValues();

  const found = checklistData.find(r => r[1] === facility);
  if (!found) return null;

  return found[5]; // status is column 5 (0-indexed)
}

function scheduleFacility(body) {
  const sheet = SpreadsheetApp.openById("1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks")
    .getSheetByName("Sheet1");

  const rowIndex = Number(body.row) - 1;
  const data = sheet.getDataRange().getValues();
  const row = data[rowIndex];

  const oldAssessor = row[13];
  const hadSchedule = row[9];

  let newStatus = "Scheduled";

  if (hadSchedule) {
    if (oldAssessor && oldAssessor !== body.assessor) {
      newStatus = "Re-assigned";
    } else {
      newStatus = "Rescheduled";
    }
  }

  // ✅ Update values
  sheet.getRange(rowIndex + 1, 10).setValue(body.date);     // Admin Scheduled Date
  sheet.getRange(rowIndex + 1, 11).setValue(body.time);     // Admin Scheduled Time
  sheet.getRange(rowIndex + 1, 12).setValue(newStatus);     // Status
  sheet.getRange(rowIndex + 1, 14).setValue(body.assessor); // Assessor

  // =============================
  // 📧 SEND EMAIL NOTIFICATION TO ASSESSOR
  // =============================
  try {
    // Get assessor email from Sheet4 (users sheet)
    const userSheet = SpreadsheetApp.openById("1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks").getSheetByName("Sheet4");
    const userData = userSheet.getDataRange().getValues();
    
    let assessorEmail = null;
    
    // Find the assessor by name
    for (let i = 1; i < userData.length; i++) {
      const userName = (userData[i][0] || "").toString().trim();
      if (userName.toLowerCase() === body.assessor.toLowerCase()) {
        assessorEmail = (userData[i][1] || "").toString().trim();
        break;
      }
    }
    
    // If we found the assessor's email, send notification
    if (assessorEmail && assessorEmail.includes("@")) {
      const facilityName = row[3]; // Column D - Facility name
      const applicantEmail = row[2]; // Column C - Applicant email
      const applicantName = row[1]; // Column B - Applicant name
      const contactNumber = row[4]; // Column E - Contact
      
      const subject = "📋 New Facility Assignment - MBFHI Assessment";
      
      const emailBody = `
YOU HAVE BEEN ASSIGNED A NEW FACILITY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ASSIGNMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Facility Name: ${facilityName}
Applicant Name: ${applicantName}
Applicant Email: ${applicantEmail}
Contact Number: ${contactNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEDULED VISIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Visit Date: ${body.date}
Visit Time: ${body.time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log in to your assessor dashboard to review the facility details and prepare for the assessment visit.

This is an automated notification from the MBFHI Administration System.
      `;
      
      MailApp.sendEmail({
        to: assessorEmail,
        subject: subject,
        body: emailBody,
        name: "MBFHI Notification System"
      });
      
      Logger.log("Assessor notification sent to: " + assessorEmail);
    } else {
      Logger.log("Assessor email not found for: " + body.assessor);
    }
  } catch (emailErr) {
    Logger.log("Assessor email notification failed: " + emailErr.message);
    // Continue even if email fails - scheduling still completes
  }

  // =============================
  // 📧 SEND EMAIL NOTIFICATION TO USER (Scheduled/Re-assigned/Rescheduled - ONCE)
  // =============================
  if (newStatus === "Scheduled" || newStatus === "Re-assigned" || newStatus === "Rescheduled") {
    try {
      // Column P (16) - Track if user notification was sent
      // This column should be empty or contain notification timestamp
      const notificationColumn = 16; // Column P (index 15)
      const alreadyNotified = row[15]; // Column P (index 15)
      
      if (alreadyNotified && alreadyNotified.toString().includes("Notified")) {
        Logger.log("User already notified, skipping email");
      } else {
        // Send email to user
        const userEmail = row[2]; // Column C - user email
        const facilityName = row[3]; // Column D - facility name
        
        if (userEmail && userEmail.includes("@")) {
          let statusMessage = "";
          if (newStatus === "Scheduled") {
            statusMessage = "Your MBFHI assessment visit has been scheduled!";
          } else if (newStatus === "Re-assigned") {
            statusMessage = "Your MBFHI assessment has been re-assigned to a new assessor.";
          } else if (newStatus === "Rescheduled") {
            statusMessage = "Your MBFHI assessment visit has been rescheduled to a new date/time.";
          }
          
          const subject = "📅 MBFHI Application Status Update";
          
          const userEmailBody = `
${statusMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Facility Name: ${facilityName}
Scheduled Visit Date: ${body.date}
Scheduled Visit Time: ${body.time}
Status: ${newStatus}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please ensure you are available on the scheduled date. If you have any questions, please contact the DOH CALABARZON office.

This is an automated notification from the MBFHI Administration System.

Note: This is the only notification you will receive regarding your scheduled visit.
          `;
          
          MailApp.sendEmail({
            to: userEmail,
            subject: subject,
            body: userEmailBody,
            name: "MBFHI Notification System"
          });
          
          // Mark as notified to prevent duplicate emails
          sheet.getRange(rowIndex + 1, notificationColumn).setValue("Notified: " + new Date().toISOString());
          
          Logger.log("User notification sent to: " + userEmail);
        }
      }
    } catch (userEmailErr) {
      Logger.log("User email notification failed: " + userEmailErr.message);
      // Continue even if email fails - scheduling still completes
    }
  }

  return { success: true, status: newStatus };
}

function getAssignedFacilities(body) {
  const email = body.email;
  const sheet = SpreadsheetApp.openById("1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks")
    .getSheetByName("Sheet1");

  const data = sheet.getDataRange().getValues();

  const map = {}; // 🔥 group by facility

  for (let i = 1; i < data.length; i++) {
    const r = data[i];

    const assessor = (r[13] || "").toLowerCase();
    if (assessor !== email.toLowerCase()) continue;

    const facility = r[3];

    let raw = r[14];

    let types = [];

    if (typeof raw === "string") {
      types = raw.split(",").map(t => t.trim()).filter(Boolean);
  } else if (Array.isArray(raw)) {
      types = raw;
  } else {
      types = ["Hospital", "Workplace"]; // fallback
  }

    // 🔥 GROUPING LOGIC
    if (!map[facility]) {
      map[facility] = {
        facility,
        types: new Set(),
      };
    }

    types.forEach(t => map[facility].types.add(t));
  }

  // 🔥 convert Set → Array
  const results = Object.values(map).map(f => ({
    facility: f.facility,
    types: Array.from(f.types),
  }));

  return { facilities: results };
}

function getAvailableDates(body) {
  const SHEET_ID = '1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks';
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet2');

  const data = sheet.getDataRange().getValues();
  const tz = Session.getScriptTimeZone();

  const available = [];
  const unavailable = [];

  for (let i = 1; i < data.length; i++) {
    const rawDate = data[i][0];
    const status = (data[i][1] || '').toString().trim().toLowerCase();

    if (!rawDate) continue;

    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) continue;

    const isoDate = Utilities.formatDate(dateObj, tz, 'yyyy-MM-dd');

    if (status === 'available') {
      available.push(isoDate);
    } else if (status === 'unavailable') {
      unavailable.push(isoDate);
    }
  }

  return { available, unavailable };
}

function submitMBFHIForm(body) {
  try {
    Logger.log("BODY: " + JSON.stringify(body));

    if (!body.fileData) {
      throw new Error("fileData missing");
    }

    let bytes;
    try {
      bytes = Utilities.base64Decode(body.fileData);
    } catch (e) {
      throw new Error("Invalid base64 received");
    }

    const blob = Utilities.newBlob(bytes, body.mimeType, body.fileName);

    const file = DriveApp
      .getFolderById('1T2luoL1HbQYyjrHQo4RzJn0iG7TyxIS2')
      .createFile(blob);

    const sheet = SpreadsheetApp
      .openById('1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks')
      .getSheetByName('Sheet1');

    sheet.appendRow([
      new Date(),
      body.name,
      body.email,
      body.facility,
      body.contact,
      file.getUrl(),
      body.preferredDate,
      body.preferredTime,
      ''
    ]);

    // =============================
    // 📧 SEND EMAIL NOTIFICATION
    // =============================
    const ADMIN_EMAIL = "pmnp4a.me@gmail.com";
    const subject = "🔔 New MBFHI Application Submitted";
    
    const emailBody = `
NEW MBFHI APPLICATION RECEIVED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICANT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${body.name}
Email: ${body.email}
Facility: ${body.facility}
Contact Number: ${body.contact}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Preferred Visit Date: ${body.preferredDate}
Preferred Visit Time: ${body.preferredTime}
Document Submitted: ${body.fileName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from the MBFHI Application System.
Please log in to the admin dashboard to review and process this application.
    `;
    
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: subject,
        body: emailBody,
        name: "MBFHI Notification System"
      });
      Logger.log("Email notification sent to: " + ADMIN_EMAIL);
    } catch (emailErr) {
      Logger.log("Email notification failed: " + emailErr.message);
      // Continue even if email fails - don't break the submission
    }

    return { success: true };

  } catch (err) {
    Logger.log("ERROR: " + err.message);
    return { success: false, message: err.message };
  }
}

function saveChatMessage(body) {
  const sheet = SpreadsheetApp
    .openById('1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks')
    .getSheetByName('Sheet3');

  sheet.appendRow([
    new Date(),
    body.from,
    body.to,
    body.message
  ]);

  return { success: true };
}

function getAdminMessages() {
  const sheet = SpreadsheetApp
    .openById('1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks')
    .getSheetByName('Sheet3');

  const data = sheet.getDataRange().getValues();

  return data.slice(1).map(r => ({
    time: r[0],
    from: r[1],
    to: r[2],
    message: r[3]
  }));
}

// =============================
// GET USER CHAT MESSAGES
// Returns messages for a specific user (sent or received)
// =============================
function getUserChatMessages(body) {
  const SHEET_ID = '1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks';
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet3');
  const data = sheet.getDataRange().getValues();
  
  const userEmail = body.email?.toLowerCase();
  const targetRecipient = body.targetRecipient?.toLowerCase();

  // Filter messages where user is sender OR recipient
  const messages = data.slice(1).filter(r => {
    const from = (r[1] || "").toLowerCase();
    const to = (r[2] || "").toLowerCase();
    
    // For user chat: show messages where user is sender OR recipient
    // Also include if targetRecipient (admin or assessor email) is involved
    return from === userEmail || 
           to === userEmail || 
           from === targetRecipient || 
           to === targetRecipient;
  });

  return messages.map(r => ({
    time: r[0],
    from: r[1],
    to: r[2],
    message: r[3]
  }));
}

// =============================
// GET ASSESSOR MESSAGES
// Returns messages for a specific assessor (sent or received)
// =============================
function getAssessorMessages(body) {
  const SHEET_ID = '1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks';
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet3');
  const data = sheet.getDataRange().getValues();
  
  const assessorEmail = body.email?.toLowerCase();
  const facility = body.facility; // Optional - filter by specific facility

  // Filter messages where assessor is sender OR recipient
  let messages = data.slice(1).filter(r => {
    const from = (r[1] || "").toLowerCase();
    const to = (r[2] || "").toLowerCase();
    
    return from === assessorEmail || to === assessorEmail;
  });

  // If facility specified, further filter
  if (facility) {
    // Get user's email from facility name
    const sheet1 = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
    const sheet1Data = sheet1.getDataRange().getValues();
    
    let userEmail = null;
    for (let i = 1; i < sheet1Data.length; i++) {
      if ((sheet1Data[i][3] || "").toLowerCase() === facility.toLowerCase()) {
        userEmail = sheet1Data[i][2]; // Column C - user email
        break;
      }
    }
    
    if (userEmail) {
      messages = messages.filter(r => {
        const from = (r[1] || "").toLowerCase();
        const to = (r[2] || "").toLowerCase();
        return from === userEmail.toLowerCase() || to === userEmail.toLowerCase();
      });
    }
  }

  return messages.map(r => ({
    time: r[0],
    from: r[1],
    to: r[2],
    message: r[3]
  }));
}

// =============================
// GET UNREAD MESSAGE COUNT
// Returns count of unread messages for user/assessor
// =============================
function getUnreadMessageCount(body) {
  const SHEET_ID = '1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks';
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet3');
  const data = sheet.getDataRange().getValues();
  
  const userEmail = body.email?.toLowerCase();

  // Count messages where user is the recipient (not sent by them)
  const unreadCount = data.slice(1).filter(r => {
    const from = (r[1] || "").toLowerCase();
    const to = (r[2] || "").toLowerCase();
    
    // Count messages sent TO this user (not from them)
    return to === userEmail && from !== userEmail;
  }).length;

  return { unreadCount };
}

function isAdmin() {
  const email = Session.getActiveUser().getEmail();
  return email === "pmnp4a.me@gmail.com";
}

function getAssessors() {
  const sheet = SpreadsheetApp
    .openById('1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks')
    .getSheetByName('Sheet4');

  const data = sheet.getDataRange().getValues();

  return data
    .slice(1)
    .filter(r => r[2] === "Assessor")
    .map(r => ({
      name: r[0],
      email: r[1],
    }));
}

function saveChecklist(body) {
  try {
    const sheet = SpreadsheetApp
      .openById('1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks')
      .getSheetByName('Sheet5');

    if (!body.facility || !body.assessor || !body.type) {
      throw new Error("Missing required fields");
    }

    // 🔥 Convert answers array → object
    const formattedAnswers = {};

    body.answers.forEach(a => {
      formattedAnswers[a.question] = {
        answer: a.answer,
        remark: a.remark || ""
      };
    });

    // 🔥 SAVE ONE ROW ONLY
    sheet.appendRow([
      new Date(),
      body.facility,
      body.assessor,
      body.type,
      JSON.stringify(formattedAnswers), // ✅ ONE COLUMN
      body.status || ""
    ]);

    return { success: true };

  } catch (err) {
    Logger.log("SAVE ERROR: " + err.message);
    return { success: false, message: err.message };
  }
}

function getChecklistByFacility(body) {
  const sheet = SpreadsheetApp
    .openById("1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks")
    .getSheetByName("Sheet5");

  const data = sheet.getDataRange().getValues();

  const results = [];

  for (let i = 1; i < data.length; i++) {
    const r = data[i];

    // If facility is specified, filter by it; otherwise return all
    if (body.facility && r[1] !== body.facility) continue;

    let parsedAnswers = {};

    try {
      parsedAnswers = JSON.parse(r[4] || "{}");
    } catch (e) {
      parsedAnswers = {};
    }

    results.push({
      facility: r[1],
      assessor: r[2],
      type: r[3],
      answers: parsedAnswers,
      status: r[5] || "", // status is column 5
    });
  }

  return results;
}

function getAdminAnalytics() {
  const sheet = SpreadsheetApp
    .openById('1i-PqQO97kXLeRr7bz6kYmlawCVXod-DKJAlrciaSZks')
    .getSheetByName('Sheet5');

  const data = sheet.getDataRange().getValues();

  const stats = {
    total: 0,
    passed: 0,
    compliance: 0,
    failed: 0,
    ongoing: 0,
  };

  const seen = new Set();

  for (let i = 1; i < data.length; i++) {
    const facility = data[i][1];
    const type = data[i][3];
    const status = data[i][5]; // since now JSON is col 4, status = col 5

    const key = facility + "-" + type;

    if (seen.has(key)) continue;
    seen.add(key);

    stats.total++;

    if (!status) {
      stats.ongoing++;
    } else if (status === "Passed") {
      stats.passed++;
    } else if (status === "For Compliance") {
      stats.compliance++;
    } else if (status === "Failed") {
      stats.failed++;
    }
  }

  return stats;
}
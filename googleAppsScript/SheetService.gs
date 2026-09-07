/* ============================================================
   SHEET SERVICE
   All spreadsheet reads, writes, and logging.

   The sheet helpers are generic and shared; the two funnels
   differ only in which header contract and tab they are handed.
   Google Sheets is the durable system of record for both — the
   notification emails are a convenience, never the record.
============================================================ */

/* -- Column positions derived from the header contracts (1-based) -- */

var DISCOUNT_COLUMNS = {

    EMAIL: 1,

    SIGNUP_DATE: 2,

    DISCOUNT_CODE: 3

};

var COMMISSION_COLUMNS = {

    INQUIRY_ID: 1,

    SUBMITTED_AT: 2,

    NAME: 3,

    EMAIL: 4,

    SURFACE: 5,

    IDEA: 6,

    OCCASION: 7,

    REFERENCED_PIECE: 8,

    SOURCE: 9

};


/* ============================================================
   SHEET ACCESS
============================================================ */

/**
 * Returns the named sheet, creating it when missing.
 */
function getOrCreateSheet(sheetName)
{

    var spreadsheet = getConfiguredSpreadsheet();

    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet)
    {

        sheet = spreadsheet.insertSheet(sheetName);

    }

    return sheet;

}

/**
 * Validates a sheet's header row against its contract and
 * rewrites the expected headers when the row is empty,
 * incomplete, or carries stale columns from an older schema.
 *
 * Header cells are corrected; existing data rows are never
 * touched.
 */
function ensureHeaders(sheet, headers)
{

    var checkWidth = Math.max(sheet.getLastColumn(), headers.length);

    var headerRange = sheet.getRange(1, 1, 1, checkWidth);

    var currentHeaders = headerRange.getValues()[0];

    var headersValid = headers.every(function (expectedHeader, index)
    {

        return currentHeaders[index] === expectedHeader;

    });

    /* Stale columns beyond the schema must be empty. */

    var extrasEmpty = currentHeaders.slice(headers.length).every(function (cell)
    {

        return cell === '';

    });

    if (!headersValid || !extrasEmpty)
    {

        headerRange.clearContent();

        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

        sheet.setFrozenRows(1);

    }

    return sheet;

}

/**
 * Returns the DiscountLeads sheet with verified headers.
 */
function getDiscountSheet()
{

    return ensureHeaders(
        getOrCreateSheet(SHEET_NAMES.DISCOUNT_LEADS),
        DISCOUNT_HEADERS
    );

}

/**
 * Returns the CommissionLeads sheet with verified headers.
 */
function getCommissionSheet()
{

    return ensureHeaders(
        getOrCreateSheet(SHEET_NAMES.COMMISSION_LEADS),
        COMMISSION_HEADERS
    );

}


/* ============================================================
   DISCOUNT LOOKUP
============================================================ */

/**
 * Finds an existing DiscountLeads row by email address,
 * comparing case-insensitively so Mary@Example.com and
 * mary@example.com are one person and one row.
 *
 * Stored addresses are normalized on write, but rows typed
 * directly into the sheet by hand will not be, so both sides of
 * the comparison are lower-cased here rather than trusting the
 * stored value. A leading apostrophe from formula neutralization
 * is stripped before comparing.
 *
 * Returns the matching row descriptor, or null.
 */
function findExistingSignup(email)
{

    var targetEmail = String(email).trim().toLowerCase();

    if (targetEmail === '')
    {

        return null;

    }

    var sheet = getDiscountSheet();

    var lastRow = sheet.getLastRow();

    if (lastRow < 2)
    {

        return null;

    }

    var rows = sheet
        .getRange(2, 1, lastRow - 1, DISCOUNT_HEADERS.length)
        .getValues();

    for (var index = 0; index < rows.length; index += 1)
    {

        var row = rows[index];

        var storedEmail = String(row[DISCOUNT_COLUMNS.EMAIL - 1])
            .replace(/^'/, '')
            .trim()
            .toLowerCase();

        if (storedEmail !== '' && storedEmail === targetEmail)
        {

            return {

                rowNumber: index + 2,

                email: storedEmail,

                signupDate: row[DISCOUNT_COLUMNS.SIGNUP_DATE - 1],

                discountCode: String(row[DISCOUNT_COLUMNS.DISCOUNT_CODE - 1] || '')

            };

        }

    }

    return null;

}


/* ============================================================
   DISCOUNT WRITES
============================================================ */

/**
 * Converts a validated discount record into a sheet row.
 */
function buildDiscountRow(record, signupDate)
{

    return [

        neutralizeFormula(record.email),

        signupDate,

        record.discountCode

    ];

}

/**
 * Appends a new DiscountLeads row and returns it.
 *
 * Callers must already hold the script lock: the duplicate check
 * and this append have to be one indivisible step, or two
 * simultaneous submissions of the same address could both find
 * no match and both append.
 */
function appendSignupRecord(record)
{

    var sheet = getDiscountSheet();

    var signupDate = new Date();

    sheet.appendRow(buildDiscountRow(record, signupDate));

    return {

        rowNumber: sheet.getLastRow(),

        email: record.email,

        signupDate: signupDate,

        discountCode: record.discountCode

    };

}

/**
 * Repairs an existing row whose Discount Code cell is empty or
 * stale, so a returning visitor and the sheet always agree on
 * the code that was emailed to them.
 *
 * Never touches the Email or Signup Date cells: the original
 * signup date is part of the record.
 */
function reconcileSignupCode(existingSignup)
{

    if (existingSignup.discountCode === DISCOUNT_CODE)
    {

        return;

    }

    var sheet = getDiscountSheet();

    sheet
        .getRange(existingSignup.rowNumber, DISCOUNT_COLUMNS.DISCOUNT_CODE)
        .setValue(DISCOUNT_CODE);

    existingSignup.discountCode = DISCOUNT_CODE;

}


/* ============================================================
   COMMISSION WRITES

   Commission inquiries are never de-duplicated. Someone asking
   about a second piece is a second inquiry, and two people can
   legitimately share a mailbox — collapsing those would lose
   real work.
============================================================ */

/**
 * Generates a short, human-quotable inquiry reference so Mary's
 * notification and the sheet row can be matched by eye.
 * PCP-0001 upward, with a UUID fallback if the counter cannot
 * be read.
 */
function generateInquiryId()
{

    try
    {

        var scriptProperties = PropertiesService.getScriptProperties();

        var currentCounter = parseInt(scriptProperties.getProperty('INQUIRY_COUNTER'), 10) || 0;

        var nextCounter = currentCounter + 1;

        scriptProperties.setProperty('INQUIRY_COUNTER', String(nextCounter));

        return 'PCP-' + ('0000' + nextCounter).slice(-4);

    }
    catch (counterError)
    {

        return 'PCP-' + Utilities.getUuid().slice(0, 8).toUpperCase();

    }

}

/**
 * Converts a validated commission record into a sheet row.
 */
function buildCommissionRow(record, inquiryId, submittedAt)
{

    return [

        inquiryId,

        submittedAt,

        neutralizeFormula(record.name),

        neutralizeFormula(record.email),

        neutralizeFormula(record.surface),

        neutralizeFormula(record.idea),

        neutralizeFormula(record.occasion),

        neutralizeFormula(record.referencedPiece),

        record.source

    ];

}

/**
 * Appends a new CommissionLeads row and returns it.
 */
function appendCommissionRecord(record)
{

    var sheet = getCommissionSheet();

    var inquiryId = generateInquiryId();

    var submittedAt = new Date();

    sheet.appendRow(buildCommissionRow(record, inquiryId, submittedAt));

    return {

        rowNumber: sheet.getLastRow(),

        inquiryId: inquiryId,

        submittedAt: submittedAt

    };

}


/* ============================================================
   LOGGING
============================================================ */

/**
 * Records one request-activity line. Logging failures are
 * swallowed so they can never break a submission.
 */
function logActivity(action, detail)
{

    try
    {

        var sheet = getOrCreateSheet(SHEET_NAMES.ACTIVITY_LOG);

        sheet.appendRow([new Date(), action, detail]);

    }
    catch (loggingError)
    {

        /* Never let logging interrupt a submission. */

    }

}

/**
 * Records one error line with stack information when available.
 */
function logError(context, error)
{

    try
    {

        var sheet = getOrCreateSheet(SHEET_NAMES.ERROR_LOG);

        var errorDetail = error && error.stack ? error.stack : String(error);

        sheet.appendRow([new Date(), context, errorDetail]);

    }
    catch (loggingError)
    {

        /* Never let logging interrupt a submission. */

    }

}

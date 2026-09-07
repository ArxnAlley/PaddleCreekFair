/* ============================================================
   CONFIG
   Central configuration for the Paddle Creek Paints backend.

   ONE Web App deployment serves TWO deliberately separate
   funnels. Nothing is shared between them but the plumbing:

       discountSignup     -> DiscountLeads   -> 2 emails
       commissionInquiry  -> CommissionLeads -> 2 emails

   A submission of one type must never write a row or send an
   email belonging to the other.

   Configurable values are read from Script Properties so no
   private identifiers live in source code.

   Script Properties used:
       SPREADSHEET_ID  - optional; falls back to the container
                         spreadsheet when the script is bound.
       OWNER_EMAIL     - optional; overrides the owner
                         notification address below without a
                         code change.
============================================================ */

/* -- Submission types --
   The routing key. The website sends one of these as
   `submissionType`; anything else is refused outright rather
   than guessed at, so a malformed request can never fall
   through into the wrong funnel. */

var SUBMISSION_TYPES = {

    DISCOUNT: 'discountSignup',

    COMMISSION: 'commissionInquiry'

};

/* -- Sheet name constants -- */

var SHEET_NAMES = {

    DISCOUNT_LEADS: 'DiscountLeads',

    COMMISSION_LEADS: 'CommissionLeads',

    ACTIVITY_LOG: 'ActivityLog',

    ERROR_LOG: 'ErrorLog'

};

/* -- DiscountLeads header contract --
   Three columns is the whole contract: this capture point asks
   for an email address and nothing else. Column order matters;
   SheetService validates and creates these automatically. */

var DISCOUNT_HEADERS = [

    'Email',

    'Signup Date',

    'Discount Code'

];

/* -- CommissionLeads header contract --
   These mirror the real fields on the Start a Piece form in
   index.html, in the order the visitor meets them. 'Referenced
   Piece' is the catalogue piece they had open when they tapped
   through, which the page already carries into the form. */

var COMMISSION_HEADERS = [

    'Inquiry ID',

    'Submitted At',

    'Name',

    'Email',

    'Surface',

    'What To Paint',

    'Occasion',

    'Referenced Piece',

    'Source'

];

/* -- The offer --
   The code is assigned server-side and is deliberately shared
   rather than per-visitor: one code Mary can recognise at the
   table without looking anything up. The website never sends a
   code, never stores one, and never displays one; whatever a
   browser posts is ignored. It reaches the customer only in
   their confirmation email.

   A commission inquiry does NOT earn this code. */

var DISCOUNT_CODE = 'PADDLE10';

var OFFER_HEADLINE = 'Get 10% Off Your First Custom Piece';

/* -- Business facts --
   Every value here is one the project has already established.
   Facebook is the only verified social account for Paddle Creek
   Paints; do not add another without the owner supplying it. */

var BUSINESS = {

    artistName: 'Mary',

    businessName: 'Paddle Creek Paints',

    studioEmail: 'paddlecreekpaints@gmail.com',

    siteUrl: 'https://paddlecreekpaints.com/',

    facebookUrl: 'https://www.facebook.com/paddlecreekpaints',

    location: 'Catlettsburg, Kentucky'

};

/* -- Owner notifications --
   Where Mary actually reads her mail. A separate constant from
   BUSINESS.studioEmail on purpose — it can be overridden per
   deployment via the OWNER_EMAIL script property without
   touching the public-facing reply-to address — even though
   both currently resolve to the same confirmed inbox. */

var DEFAULT_OWNER_EMAIL = 'paddlecreekpaints@gmail.com';

/* -- Email subjects -- */

var EMAIL_SUBJECTS = {

    discountCustomer: 'Welcome to Paddle Creek Paints — here’s your 10% off!',

    discountOwner: 'New 10% signup — Paddle Creek Paints',

    commissionCustomer: 'Thank you for your custom piece inquiry — Paddle Creek Paints',

    commissionOwner: 'New commission inquiry — Paddle Creek Paints'

};

/* -- Input limits -- */

var INPUT_LIMITS = {

    maxEmailLength: 254,

    maxNameLength: 120,

    maxShortTextLength: 200,

    maxMessageLength: 2000,

    maxSourceLength: 60

};

/* -- Concurrency --
   Long enough for a queued write to clear on a shared script,
   short enough that a visitor is never left waiting. */

var LOCK_TIMEOUT_MS = 20000;


/* ============================================================
   CONFIG ACCESS
============================================================ */

/**
 * Returns the spreadsheet used for both funnels.
 *
 * Prefers the SPREADSHEET_ID script property, then falls back
 * to the container spreadsheet when the script is bound.
 */
function getConfiguredSpreadsheet()
{

    var scriptProperties = PropertiesService.getScriptProperties();

    var spreadsheetId = scriptProperties.getProperty('SPREADSHEET_ID');

    if (spreadsheetId)
    {

        return SpreadsheetApp.openById(spreadsheetId);

    }

    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (activeSpreadsheet)
    {

        return activeSpreadsheet;

    }

    throw new Error(
        'No spreadsheet configured. Set the SPREADSHEET_ID script property ' +
        'or bind this script to a spreadsheet.'
    );

}

/**
 * The address Mary's notifications go to. A Script Property
 * wins so the address can change without a redeploy.
 */
function getOwnerEmail()
{

    try
    {

        var configured = PropertiesService
            .getScriptProperties()
            .getProperty('OWNER_EMAIL');

        return configured || DEFAULT_OWNER_EMAIL;

    }
    catch (propertyError)
    {

        return DEFAULT_OWNER_EMAIL;

    }

}

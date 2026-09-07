/* ============================================================
   CODE
   Web App entry points.

   ONE deployment, ONE /exec URL, TWO funnels kept strictly
   apart by an explicit submissionType on every request:

       doPost → parse → honeypot → ROUTE
                                    ├── discountSignup
                                    │     validate → lock →
                                    │     DiscountLeads →
                                    │     customer welcome +
                                    │     Mary's alert
                                    └── commissionInquiry
                                          validate → lock →
                                          CommissionLeads →
                                          customer ack +
                                          Mary's notification

   The type is never inferred from which fields happen to be
   present — an unrecognised or missing submissionType is
   refused. That is what guarantees a commission inquiry can
   never land in DiscountLeads, and a discount signup can never
   create a commission record or be granted PADDLE10 by
   accident.
============================================================ */

/**
 * Health-check endpoint. Confirms the deployment is live
 * without exposing any spreadsheet data.
 */
function doGet()
{

    return createJsonOutput({

        success: true,

        message: 'Paddle Creek Paints service is online.',

        accepts: [SUBMISSION_TYPES.DISCOUNT, SUBMISSION_TYPES.COMMISSION]

    });

}

/**
 * Receives both kinds of submission from the website.
 */
function doPost(requestEvent)
{

    var payload;

    /* -- Parse the request body -- */

    try
    {

        payload = parseRequestPayload(requestEvent);

    }
    catch (parseError)
    {

        logError('doPost:parse', parseError);

        return buildErrorResponse(
            'Unable to read your details.',
            ['Invalid request format.']
        );

    }

    /* -- Route before anything else touches a sheet -- */

    var submissionType = resolveSubmissionType(payload);

    if (submissionType === '')
    {

        logActivity('ROUTING_REFUSED', 'Unrecognised submissionType.');

        return buildErrorResponse(
            'Unable to process this submission.',
            ['Unrecognised submission type.']
        );

    }

    /* -- Honeypot: accept silently, store nothing, send nothing -- */

    if (isSpamSubmission(payload))
    {

        logActivity('SPAM_BLOCKED', 'Honeypot filled on ' + submissionType + '.');

        return submissionType === SUBMISSION_TYPES.DISCOUNT

            ? buildDiscountSuccessResponse('Check your inbox for your discount code.', false, true)

            : buildCommissionSuccessResponse('Thank you — your inquiry is on its way to Mary.', '', true);

    }

    if (submissionType === SUBMISSION_TYPES.DISCOUNT)
    {

        return handleDiscountSignup(payload);

    }

    return handleCommissionInquiry(payload);

}


/* ============================================================
   DISCOUNT SIGNUP
============================================================ */

function handleDiscountSignup(payload)
{

    var validation = validateDiscountPayload(payload);

    if (!validation.isValid)
    {

        logActivity('DISCOUNT_VALIDATION_FAILED', validation.errors.join(' | '));

        return buildErrorResponse(
            'Unable to send your discount code.',
            validation.errors
        );

    }

    var record = validation.record;

    /* -- Write under a lock --
       The duplicate check and the append have to be one
       indivisible step. Without the lock, two submissions of the
       same address arriving together could both find no match
       and both append a row. */

    var lock = LockService.getScriptLock();

    var signup;

    var isReturningSignup;

    try
    {

        lock.waitLock(LOCK_TIMEOUT_MS);

        var existingSignup = findExistingSignup(record.email);

        if (existingSignup)
        {

            /* Already on the list. No second row is written — the
               visitor simply gets their code again. */

            reconcileSignupCode(existingSignup);

            signup = existingSignup;

            isReturningSignup = true;

            logActivity('DISCOUNT_REPEAT', record.email);

        }
        else
        {

            signup = appendSignupRecord(record);

            isReturningSignup = false;

            logActivity('DISCOUNT_CREATED', record.email);

        }

    }
    catch (submissionError)
    {

        logError('handleDiscountSignup:write', submissionError);

        return buildErrorResponse(
            'Unable to send your discount code.',
            ['A server error occurred. Please try again.']
        );

    }
    finally
    {

        try
        {

            lock.releaseLock();

        }
        catch (lockError)
        {

            /* Lock may not have been acquired; nothing to release. */

        }

    }

    /* -- Emails --
       Deliberately outside the lock: the row is committed, and
       mail delivery is slow enough that holding the lock through
       it would queue every other visitor behind this send. */

    var emailSent = sendDiscountCustomerEmail(
        {

            email: signup.email,

            discountCode: DISCOUNT_CODE

        },
        isReturningSignup
    );

    /* Mary is told about NEW signups only — a returning visitor
       asking for their code again is not a new name on the list. */

    if (!isReturningSignup)
    {

        sendDiscountOwnerEmail(signup);

    }

    var responseMessage = emailSent

        ? (isReturningSignup
            ? 'You are already on the list — your code is on its way again.'
            : 'Your 10% discount code is on its way. Look for an email from '
                + BUSINESS.businessName + '.')

        : 'You are on the list. If the email does not arrive, write to '
            + BUSINESS.studioEmail + '.';

    return buildDiscountSuccessResponse(responseMessage, isReturningSignup, emailSent);

}


/* ============================================================
   COMMISSION INQUIRY

   Not de-duplicated: a second inquiry is a second piece to
   discuss. No discount code is issued here, and no
   DiscountLeads row is created.
============================================================ */

function handleCommissionInquiry(payload)
{

    var validation = validateCommissionPayload(payload);

    if (!validation.isValid)
    {

        logActivity('COMMISSION_VALIDATION_FAILED', validation.errors.join(' | '));

        return buildErrorResponse(
            'Unable to send your inquiry.',
            validation.errors
        );

    }

    var record = validation.record;

    var lock = LockService.getScriptLock();

    var receipt;

    try
    {

        lock.waitLock(LOCK_TIMEOUT_MS);

        receipt = appendCommissionRecord(record);

        logActivity('COMMISSION_CREATED', receipt.inquiryId + ' — ' + record.email);

    }
    catch (submissionError)
    {

        logError('handleCommissionInquiry:write', submissionError);

        return buildErrorResponse(
            'Unable to send your inquiry.',
            ['A server error occurred. Please try again.']
        );

    }
    finally
    {

        try
        {

            lock.releaseLock();

        }
        catch (lockError)
        {

            /* Lock may not have been acquired; nothing to release. */

        }

    }

    var emailSent = sendCommissionCustomerEmail(record, receipt);

    sendCommissionOwnerEmail(record, receipt);

    var responseMessage = emailSent

        ? 'Thank you — your inquiry is with ' + BUSINESS.artistName
            + ', and a copy is on its way to your inbox.'

        : 'Thank you — your inquiry is with ' + BUSINESS.artistName
            + '. If you do not see a copy in your inbox, write to '
            + BUSINESS.studioEmail + '.';

    return buildCommissionSuccessResponse(responseMessage, receipt.inquiryId, emailSent);

}


/* ============================================================
   REQUEST PARSING
============================================================ */

/**
 * Supports both JSON bodies (the website sends JSON as
 * text/plain to stay CORS-simple) and form-encoded requests.
 */
function parseRequestPayload(requestEvent)
{

    if (requestEvent && requestEvent.postData && requestEvent.postData.contents)
    {

        var contents = requestEvent.postData.contents;

        try
        {

            return JSON.parse(contents);

        }
        catch (jsonError)
        {

            /* Fall through to form-encoded parsing. */

        }

    }

    if (requestEvent && requestEvent.parameter && Object.keys(requestEvent.parameter).length > 0)
    {

        return requestEvent.parameter;

    }

    throw new Error('Request contained no readable payload.');

}


/* ============================================================
   TEST FUNCTIONS
   Run from the Apps Script editor to verify each funnel end to
   end without the website.

   Set TEST_EMAIL to a mailbox you can actually open, so the
   customer emails can be checked as well as the rows. Mary's
   notifications go to the configured owner address.
============================================================ */

var TEST_EMAIL = 'PUT_A_REAL_MAILBOX_HERE@example.com';

function simulateRequest(payload)
{

    return {

        postData: {

            contents: JSON.stringify(payload),

            type: 'text/plain'

        }

    };

}

/**
 * Funnel 1 — the 10% offer.
 *
 * Expect: ONE new DiscountLeads row, TWO customer emails (the
 * repeat submission re-sends), ONE owner alert (new signups
 * only), and a rejection for the malformed address.
 */
function testDiscountSignup()
{

    var payload = {

        submissionType: SUBMISSION_TYPES.DISCOUNT,

        email: TEST_EMAIL,

        honeypot: '',

        source: 'testFunction'

    };

    Logger.log('New signup      : ' + doPost(simulateRequest(payload)).getContent());

    /* Same address, upper-cased: must match case-insensitively,
       write NO second row, and re-send the welcome email. */

    payload.email = TEST_EMAIL.toUpperCase();

    Logger.log('Repeat signup   : ' + doPost(simulateRequest(payload)).getContent());

    payload.email = 'not-an-email';

    Logger.log('Invalid address : ' + doPost(simulateRequest(payload)).getContent());

}

/**
 * Funnel 2 — Start a Piece.
 *
 * Expect: ONE new CommissionLeads row, ONE customer
 * acknowledgement, ONE owner notification, NO DiscountLeads row
 * and NO discount email.
 */
function testCommissionInquiry()
{

    var payload = {

        submissionType: SUBMISSION_TYPES.COMMISSION,

        visitorName: 'Test Visitor',

        visitorEmail: TEST_EMAIL,

        pieceSurface: 'Cast-iron skillet',

        pieceIdea: 'Wildflowers around the rim, in the colours of my grandmother’s garden.',

        pieceOccasion: 'A birthday in October',

        referencedPiece: 'Horse portrait with roses and gold leaf · Canvas',

        honeypot: '',

        source: 'testFunction'

    };

    Logger.log('Commission      : ' + doPost(simulateRequest(payload)).getContent());

    var incomplete = {

        submissionType: SUBMISSION_TYPES.COMMISSION,

        visitorName: '',

        visitorEmail: 'not-an-email',

        pieceIdea: ''

    };

    Logger.log('Invalid inquiry : ' + doPost(simulateRequest(incomplete)).getContent());

}

/**
 * Routing guard — a payload that does not declare its type must
 * be refused outright rather than guessed at.
 */
function testRoutingRefusal()
{

    Logger.log('No type         : ' + doPost(simulateRequest({ email: TEST_EMAIL })).getContent());

    Logger.log('Unknown type    : ' + doPost(simulateRequest({ submissionType: 'somethingElse', email: TEST_EMAIL })).getContent());

}
